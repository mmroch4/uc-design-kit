# Novo ano letivo

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/novo-ano.html

Cada ano é uma pasta. Para o ano seguinte copia-se a pasta, revê-se o `course.js` e procuram-se as datas escritas à mão. As semanas, a semana atual e o estado dos prazos recalculam-se sozinhos.

## 1. Copiar a pasta

```sh
cp -r 2526 2627
```

A pasta do ano anterior fica como está, para os alunos que a consultam. Um link "Anos anteriores" na página `sobre.html` do ano novo ajuda a encontrá-la.

## 2. Rever o course.js

- **`edition`**: `"2026/27"`.
- **`semester.start`**: o primeiro dia de aulas do novo calendário escolar. É a mudança que move todas as semanas.
- **`semester.weeks` e `semester.breaks`**: número de semanas e interrupções (semanas de estudo, feriados prolongados).
- **`deadlines`**: todas as datas. Os prazos ainda sem dia podem ficar com `"AAAA-MM"` ou `null` e serem completados durante o semestre.
- **`notices`**: apagar os avisos do ano anterior, deixando a lista vazia ou um aviso de boas-vindas.
- **`team`**: quem dá aulas e as turmas de cada um.
- **`footer` e `updated`**: o ano do rodapé e a data de atualização.
- **`today`**: não deve existir; se ficou de testes, apagar a linha.

## 3. Rever as páginas

O HTML tem poucas datas, porque as do calendário vêm do `course.js`. As que existem (horários, "aulas a partir de…", sumários) encontram-se com uma pesquisa pelo ano anterior:

```sh
cd 2627
grep -rn "2025\|2026" --include="*.html" .
```

- **Semanas.** Títulos e conteúdo de cada [`<uc-week>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-week.md), se a ordem da matéria mudou. Sumários do ano anterior apagam-se.
- **Guiões e enunciados.** Links para ficheiros que mudaram de nome.
- **Avaliação e horários.** Regras, pesos, turmas e salas.
- **Links absolutos.** Um link para `…/2526/…` dentro da pasta nova aponta para o ano anterior; os links relativos não têm esse problema.

## 4. Versão do kit

Com `kit/v1/` nos endereços não há nada a fazer: o site usa sempre a versão 1 mais recente. Se o site fixou uma versão exata (`kit/v1.0.0/`), o início do ano é a altura certa para passar à mais recente, trocando o número nos três endereços do `<head>` de cada página:

```sh
grep -rl "kit/v1.0.0/" --include="*.html" . | xargs sed -i "s#kit/v1.0.0/#kit/v1.2.0/#g"
```

Ver [Versão do kit](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md#versao). Em macOS, `sed -i ""` em vez de `sed -i`.

## 5. Verificar e publicar

Abre-se o site com `?today=` num dia da primeira semana, por exemplo `index.html?today=2026-09-16`, e confirma-se que a semana 1 é a atual e que os prazos são os do ano novo. Depois publica-se a pasta como no ano anterior (ver [Publicar](https://uc-design-kit.miguelrocha.dev/docs/pt/publicar.md)).
