# Materiais e programa

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/seccoes/materiais.html

Os slides e o código de cada aula, o programa da cadeira, a bibliografia e as ligações que os alunos usam todas as semanas.

Tema das pré-visualizações

Clássico (padrão)

Moderno (modern)

Institucional (institutional)

Manual (handbook)

Editorial (editorial)

Compacto (compact)

Com serifa (serif)

Alto contraste (high-contrast)

O código copiado é o mesmo em todos: o tema escolhe-se uma vez, no [course.js](https://uc-design-kit.miguelrocha.dev/docs/pt/personalizar/criar-tema.md#temas-prontos).

## Lista de materiais

Uma linha por aula, com a data da última atualização: o kit transforma cada ligação num botão com o tipo do ficheiro e marca o que é novo.

Exemplo (lista de materiais), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/materials-list.html):

```html
<uc-materials>
  <ol>
    <li><time datetime="2025-11-24">24 nov</time> Recursividade
      <a href="#" data-type="pdf">Slides</a> <a href="#" data-type="archive">Código</a></li>
    <li><time datetime="2025-11-17">17 nov</time> Pesquisa e ordenação
      <a href="#" data-type="pdf">Slides</a> <a href="https://www.youtube.com/">Aula gravada</a></li>
    <li>Revisões para o teste prático</li>
  </ol>
</uc-materials>
```

- O tipo vem do endereço (`.pdf`, `.zip`, YouTube…); `data-type` escolhe-o à mão.
- Componente: [`<uc-materials>`](https://uc-design-kit.miguelrocha.dev/docs/pt/componentes/uc-materials.md).

## Programa

Os temas da cadeira numerados, cada um com uma frase.

Exemplo (programa), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/syllabus.html):

```html
<section class="uc-section" aria-labelledby="programa">
  <h2 id="programa">Programa</h2>
  <ol class="uc-steps">
    <li>
      <h3>Fundamentos</h3>
      <p>Variáveis, tipos, expressões e controlo de fluxo.</p>
    </li>
    <li>
      <h3>Funções e recursividade</h3>
      <p>Decomposição de problemas, caso base e passo recursivo.</p>
    </li>
    <li>
      <h3>Pesquisa e ordenação</h3>
      <p>Pesquisa binária, algoritmos de ordenação e a sua complexidade.</p>
    </li>
  </ol>
</section>
```

- Bloco `uc-steps`: os números 01, 02… são decorativos, a lista dá a posição.

## Bibliografia

Cada livro com os autores e a edição numa segunda linha.

Exemplo (bibliografia), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/bibliography.html):

```html
<section class="uc-section" aria-labelledby="bibliografia">
  <h2 id="bibliografia">Bibliografia</h2>
  <ul class="uc-links">
    <li><a href="#">Introduction to Algorithms</a><span>Cormen, Leiserson, Rivest e Stein · MIT Press, 4.ª edição</span></li>
    <li><a href="#">Algorithms</a><span>Sedgewick e Wayne · Addison-Wesley, 4.ª edição</span></li>
    <li><a href="#">Think Like a Programmer</a><span>Spraul · No Starch Press · leitura complementar</span></li>
  </ul>
</section>
```

- Bloco `uc-links`: o `<span>` depois da ligação é a descrição.

## Ligações úteis

As plataformas e páginas externas, em colunas.

Exemplo (ligações úteis), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/sections/links-grid.html):

```html
<section class="uc-section" aria-labelledby="ligacoes">
  <h2 id="ligacoes">Ligações úteis</h2>
  <ul class="uc-links uc-links--grid">
    <li><a href="#">Plataforma de entregas</a><span>Submeter os trabalhos</span></li>
    <li><a href="#">Fórum da UC</a><span>Dúvidas e avisos</span></li>
    <li><a href="#">Documentação da linguagem</a><span>Referência oficial</span></li>
    <li><a href="#">Exames anteriores</a><span>Com resolução</span></li>
  </ul>
</section>
```

- Bloco `uc-links--grid`; uma só coluna no telemóvel.
