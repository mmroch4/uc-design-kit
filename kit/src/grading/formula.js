/**
 * Formulas and rules of <uc-grading> (docs/plan/grading-api.md 4, 5, 6 and
 * 10): tokenizer, recursive descent parser, evaluator, weight extraction and
 * printer. No DOM, no eval: page text only ever becomes a tree.
 *
 * Exposed as UC.internal.grading; part of uc-grading.js.
 */
(function (UC) {
  "use strict";
  if (!UC) return;

  const MAX_LENGTH = 500;
  const MAX_DEPTH = 32;
  const NAME = /^[A-Za-z_]\w*$/;
  // One token per match: space, number, name, comparison, operator or separator. A comma between digits is a decimal mark (4.1).
  const TOKEN = /\s+|(\d+(?:[.,]\d+)?)|([A-Za-z_]\w*)|(>=|<=|[<>=≥≤])|([-+*/×·−();,])/y;
  const SAME = { "×": "*", "·": "*", "−": "-", "≥": ">=", "≤": "<=", ",": ";" };
  const COMPARE = { ">=": (a, b) => a > b - 1e-9, ">": (a, b) => a > b + 1e-9, "<=": (a, b) => a < b + 1e-9, "<": (a, b) => a < b - 1e-9, "=": (a, b) => Math.abs(a - b) <= 1e-9 };
  const PRINTED = { ">=": "≥", "<=": "≤", "-": "−", "*": "×" };
  const isFunction = (name) => /^(max|min)$/i.test(name);

  /** An error whose message is the contract's (section 10), without the "[uc-kit] uc-grading: " prefix. */
  const fail = (message) => {
    throw new Error(message);
  };

  /** Text → tokens { type: "number"|"name"|"cmp"|"op", value, start }. `where` is "formula 1" or "rule 2". */
  function tokenize(text, where) {
    if (text.length > MAX_LENGTH) fail(`${where}: longer than ${MAX_LENGTH} characters.`);
    const tokens = [];
    TOKEN.lastIndex = 0;
    for (let at = 0, match; at < text.length; at = TOKEN.lastIndex) {
      if (!(match = TOKEN.exec(text))) fail(`${where}, column ${at + 1}: unexpected "${text[at]}".`);
      const [, number, name, cmp, op] = match;
      if (number) tokens.push({ type: "number", value: Number(number.replace(",", ".")), start: at });
      else if (name) tokens.push({ type: "name", value: name, start: at });
      else if (cmp || op) tokens.push({ type: cmp ? "cmp" : "op", value: SAME[cmp || op] || cmp || op, start: at });
    }
    tokens.end = text.length;
    return tokens;
  }

  /** Tokens → tree (4.2). `rule`: exactly one comparison; otherwise an optional "NAME =" prefix. */
  function parse(text, where, rule) {
    const tokens = tokenize(text, where);
    let i = 0;
    let depth = 0;
    const peek = () => tokens[i] || { type: "end", start: tokens.end };
    const at = (token, message) => fail(`${where}, column ${token.start + 1}: ${message}`);
    const unexpected = (token) =>
      token.type === "end" ? at(token, "the formula ends too early.") : token.type === "cmp" && !rule ? at(token, "comparisons belong in data-rules.") : at(token, `unexpected "${text.slice(token.start).match(/^(\w+|\S)/)[0]}".`);
    const is = (value) => peek().value === value && ++i;
    const expect = (value) => is(value) || at(peek(), `expected "${value}".`);
    const nest = () => ++depth > MAX_DEPTH && fail(`${where}: nested too deeply.`);

    function expression() {
      let node = term();
      for (let token; (token = peek()).value === "+" || token.value === "-"; ) i++, (node = { type: token.value, left: node, right: term(), start: token.start });
      return node;
    }
    function term() {
      let node = unary();
      for (let token; (token = peek()).value === "*" || token.value === "/"; ) {
        i++;
        const right = unary();
        if (token.value === "/" && right.type === "number" && right.value === 0) at(right, "division by 0.");
        node = { type: token.value, left: node, right, start: token.start };
      }
      return node;
    }
    function unary() {
      const token = peek();
      if (!is("-")) return primary();
      nest();
      const node = { type: "neg", arg: unary(), start: token.start };
      depth--;
      return node;
    }
    function primary() {
      const token = peek();
      i++;
      if (token.type === "number") return { type: "number", value: token.value, start: token.start };
      if (token.value === "(" && token.type === "op") {
        nest();
        const node = expression();
        expect(")");
        depth--;
        return node;
      }
      if (token.type !== "name") i--, unexpected(token);
      if (peek().value !== "(") return isFunction(token.value) ? at(peek(), 'expected "(".') : { type: "name", name: token.value, start: token.start };
      const type = token.value.toLowerCase();
      if (!isFunction(type)) at(token, `unknown function "${token.value}". Only max and min.`);
      i++;
      nest();
      const args = [expression()];
      while (is(";")) args.push(expression());
      expect(")");
      depth--;
      if (args.length < 2) at(token, `${type} needs at least two arguments (did you mean ";" instead of ","?).`);
      return { type, args, start: token.start };
    }

    let result;
    if (rule) {
      if (tokens.filter((token) => token.type === "cmp").length !== 1) fail(`${where}: a rule needs exactly one comparison (>=, >, <=, <, =).`);
      const left = expression();
      const op = peek();
      if (op.type !== "cmp") unexpected(op);
      i++;
      result = { op: op.value, left, right: expression() };
    } else {
      let name = null;
      if (tokens[1] && tokens[1].value === "=" && tokens[0].type === "name") (name = tokens[0].value), (i = 2);
      result = { name, tree: expression() };
    }
    if (i < tokens.length) unexpected(peek());
    return result;
  }

  /** Every name node of a tree, in reading order. */
  const namesOf = (node) => (node.type === "name" ? [node] : [node.left, node.right, node.arg, ...(node.args || [])].filter(Boolean).flatMap(namesOf));

  /**
   * The model of one element (DOM-free, so a course.js source can feed it later, D1):
   *   components: [{ code, bonus }] top-level items, in order; parts: part codes;
   *   formulas: the <code> texts; rules: the <code> texts (null for a text rule);
   *   result: the `result` attribute or null.
   * Returns { formulas: [{ name, tree }], result, columns, rules }. Throws the first formula
   * error; a rule that fails is null in `rules` with its message in `ruleErrors`.
   */
  function model({ components, parts = [], formulas = [], rules = [], result = null }) {
    const codes = [];
    const bonus = [];
    components.forEach(({ code, bonus: isBonus }, index) => {
      if (isBonus) return bonus.push(code);
      // Legacy weights with a rules list (no formulas) need no codes.
      if (formulas.length && (!NAME.test(code) || isFunction(code))) fail(`component ${index + 1} has no data-code; formulas need one on every component.`);
      if (formulas.length && codes.includes(code)) fail(`component ${index + 1}: "${code}" is already a component code.`);
      codes.push(code);
    });
    const known = [...codes, ...parts];
    const later = formulas.map((text) => (text.match(/^\s*([A-Za-z_]\w*)\s*=(?!=)/) || [])[1]);
    const list = formulas.map((text, index) => {
      const where = `formula ${index + 1}`;
      const formula = parse(text, where);
      const { name } = formula;
      if (name !== null) {
        if (isFunction(name) || name === "RESULT") fail(`${where}: "${name}" cannot be a formula name.`);
        if (known.includes(name) || bonus.includes(name)) fail(`${where}: "${name}" is already a ${codes.includes(name) || parts.includes(name) || bonus.includes(name) ? "component code" : "formula name"}.`);
      }
      for (const node of namesOf(formula.tree)) {
        const column = `${where}, column ${node.start + 1}: `;
        if (known.includes(node.name)) continue;
        if (bonus.includes(node.name)) fail(`${column}"${node.name}" is a bonus; it is added to the result automatically.`);
        if (later.includes(node.name)) fail(`${column}"${node.name}" is defined later; a formula can only use earlier ones.`);
        fail(`${column}unknown name "${node.name}". Known: ${known.join(", ")}.`);
      }
      if (name !== null) known.push(name);
      return formula;
    });
    let resultIndex = list.length - 1;
    if (result !== null && (resultIndex = list.findIndex((formula) => formula.name === result)) < 0) fail(`result="${result}" names no formula.`);
    const byName = new Map(list.filter((formula) => formula.name !== null).map((formula) => [formula.name, formula.tree]));
    const ruleNames = [...known, ...bonus, "RESULT"];
    const ruleErrors = [];
    const ruleTrees = rules.map((text, index) => {
      if (text === null) return null;
      try {
        const rule = parse(text, `rule ${index + 1}`, true);
        for (const node of [...namesOf(rule.left), ...namesOf(rule.right)])
          if (!ruleNames.includes(node.name)) fail(`rule ${index + 1}, column ${node.start + 1}: unknown name "${node.name}". Known: ${ruleNames.join(", ")}.`);
        return rule;
      } catch (error) {
        ruleErrors[index] = error.message;
        return null;
      }
    });
    const resultFormula = list[resultIndex];
    return { formulas: list, result: resultFormula, columns: resultFormula ? columnsOf(resultFormula.tree, byName) : null, rules: ruleTrees, ruleErrors };
  }

  /**
   * Weight columns (6): the result's branches, each { name, coefficients: { code: c } },
   * or null when a branch is not linear. `name` is the formula name of a branch that is one.
   */
  function columnsOf(tree, byName) {
    const resolve = (node) => (node.type === "name" && byName.has(node.name) ? resolve(byName.get(node.name)) : node);
    const root = resolve(tree);
    const flatten = (node) => (resolve(node).type === root.type ? resolve(node).args.flatMap(flatten) : [node]);
    const branches = root.args ? flatten(root) : [tree];
    const columns = branches.map((branch) => {
      const linear = linearOf(branch, byName);
      if (linear) delete linear[""];
      return linear && { name: branch.type === "name" && byName.has(branch.name) ? branch.name : null, coefficients: linear };
    });
    return columns.every(Boolean) ? columns : null;
  }

  /** c0 + Σ ci × code_i as { "": c0, code: ci }, or null when the tree is not linear. */
  function linearOf(node, byName) {
    const scaled = (linear, factor) => linear && Object.fromEntries(Object.entries(linear).map(([code, c]) => [code, c * factor]));
    const constant = (linear) => Object.keys(linear).join() === "" && linear[""];
    const { type } = node;
    if (type === "number") return { "": node.value };
    if (type === "name") return byName.has(node.name) ? linearOf(byName.get(node.name), byName) : { "": 0, [node.name]: 1 };
    if (type === "neg") return scaled(linearOf(node.arg, byName), -1);
    const left = node.left && linearOf(node.left, byName);
    const right = left && linearOf(node.right, byName);
    if (!right) return null;
    if (type === "*") return constant(left) !== false ? scaled(right, left[""]) : constant(right) !== false ? scaled(left, right[""]) : null;
    if (type === "/") return constant(right) ? scaled(left, 1 / right[""]) : null;
    const sum = { ...left };
    for (const code in right) sum[code] = (sum[code] || 0) + (type === "+" ? 1 : -1) * right[code];
    return sum;
  }

  /** Value of a tree (5.1); `value(name)` gives components and earlier formulas. NaN after a division by 0. */
  function evaluate(node, value) {
    const run = (child) => evaluate(child, value);
    switch (node.type) {
      case "number": return node.value;
      case "name": return value(node.name);
      case "neg": return -run(node.arg);
      case "+": return run(node.left) + run(node.right);
      case "-": return run(node.left) - run(node.right);
      case "*": return run(node.left) * run(node.right);
      case "/": {
        const divisor = run(node.right);
        return divisor === 0 ? NaN : run(node.left) / divisor;
      }
      default: return Math[node.type](...node.args.map(run));
    }
  }

  /** true, false or null (undefined, 5.4) for a rule tree. */
  function check(rule, value) {
    const left = evaluate(rule.left, value);
    const right = evaluate(rule.right, value);
    return Number.isNaN(left) || Number.isNaN(right) ? null : COMPARE[rule.op](left, right);
  }

  const PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2, neg: 3 };
  const level = (node) => PRECEDENCE[node.type] || 4;

  /**
   * Tree → array of strings and whatever `fn(type)` returns for max/min (7.1).
   * Parentheses only where precedence needs them; `alias` renames names (RESULT → "Nota").
   */
  function print(node, fn = (type) => type, alias = {}) {
    const number = new Intl.NumberFormat(UC.lang, { maximumFractionDigits: 3, useGrouping: false });
    const separator = number.format(1.5).includes(",") ? "; " : ", ";
    const walk = (node, parens) => {
      let out;
      const { type } = node;
      if (type === "number") out = [number.format(node.value)];
      else if (type === "name") out = [alias[node.name] || node.name];
      else if (type === "neg") out = ["−", walk(node.arg, level(node.arg) < 3)];
      else if (node.args) out = [fn(type), "(", node.args.map((arg, index) => [index ? separator : "", walk(arg)]), ")"];
      else {
        const own = level(node);
        const right = level(node.right);
        out = [walk(node.left, level(node.left) < own), ` ${PRINTED[type] || type} `, walk(node.right, right < own || (right === own && (type === "-" || type === "/")))];
      }
      return parens ? ["(", out, ")"] : out;
    };
    return walk(node).flat(Infinity);
  }

  /** A rule tree printed: "E ≥ 4,9". */
  const printRule = (rule, fn, alias) => [print(rule.left, fn, alias), ` ${PRINTED[rule.op] || rule.op} `, print(rule.right, fn, alias)].flat();

  UC.internal.grading = { fail, tokenize, parse, model, evaluate, check, print, printRule };
})(window.UC);
