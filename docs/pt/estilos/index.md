# Princípios de design

Fonte: https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/index.html

O kit faz páginas de cadeira simples, leves e acessíveis. Estes princípios explicam as escolhas do kit e servem de guia para o que o professor acrescenta.

## Simples

Um estudante abre o site da cadeira para saber o que há esta semana, quando é a próxima entrega e onde estão os slides. Tudo o que não ajuda a responder a isso pesa.

- **Pouca cor.** Texto escuro sobre branco, uma cor de destaque para links e ações, âmbar para avaliação. Ver [Cor](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/cor.md).
- **Sem decoração.** Sem sombras, gradientes, ícones a enfeitar títulos ou imagens de fundo. Uma borda fina separa o que precisa de ser separado.
- **Um só estilo.** As cadeiras do mesmo departamento ficam parecidas, e um estudante que conhece um site sabe usar os outros.

## Leve

O kit é um ficheiro CSS e um ficheiro JavaScript, com as letras servidas ao lado. Comprimidos, os dois têm cerca de 35 kB. Não há passo de compilação, dependências nem pedidos a outros servidores: uma página abre-se do disco, de um servidor da universidade ou do GitHub Pages da mesma forma.

O conteúdo está no HTML. Sem JavaScript, as semanas, os guiões e as tabelas continuam lá; só se perde o que o JavaScript acrescenta (datas calculadas, prazos, o estado das semanas).

## Acessível

Os componentes geram HTML semântico, cumprem o contraste de 4,5:1, funcionam com o teclado e mostram o foco. Os testes do kit correm o axe em todas as páginas. O que cabe a quem escreve as páginas (texto alternativo, títulos por ordem, links com nome) está em [Acessibilidade](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/acessibilidade.md).

## Hierarquia

Numa página, o olhar deve encontrar primeiro o que importa agora. O kit marca a importância com tamanho, peso e espaço, pela ordem, e só depois com cor:

- Um `<h1>` por página, uma introdução curta (`uc-lead`), depois secções com `<h2>`. Ver [Tipografia](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/tipografia.md).
- O que é de agora aparece destacado sem esforço do professor: a semana atual, o próximo prazo, os avisos novos.
- Destaca-se uma coisa por secção. Um cartão com `uc-card--accent` entre cartões normais chama a atenção; três já não.

## Densidade

O kit é arejado no texto e compacto nas listas. Os parágrafos têm entrelinha de 1,6 e no máximo 720 px de largura; as listas de semanas, prazos e avisos mostram uma linha por item, com o detalhe escondido até se abrir. O espaço entre blocos sai de uma escala fixa ([Espaço e forma](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/espaco.md)), e é o espaço, não as linhas, que agrupa o que está junto.

Uma página longa não é um problema se os títulos a dividirem bem. Um problema é uma página com tudo ao mesmo nível: aí vale a pena separar em secções, ou passar parte para outra página.

## Cartão, caixa ou tabela

Os três blocos mais usados servem para coisas diferentes.

### Cartão

`uc-card` para itens do mesmo tipo, lado a lado, cada um com um título e pouco texto: projetos, materiais, pessoas. Dentro de `uc-grid` organizam-se em colunas que se ajustam à largura. Quando o cartão inteiro é um link, escreve-se como `<a class="uc-card">`.

Exemplo (cartões numa grelha), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/styles/card.html):

```html
<div class="uc-grid">
  <a class="uc-card" href="#">
    <strong>Projeto 1</strong>
    <span class="uc-muted">Enunciado, ficheiros de partida e testes.</span>
  </a>
  <a class="uc-card" href="#">
    <strong>Projeto 2</strong>
    <span class="uc-muted">Publicado na semana 8.</span>
  </a>
  <div class="uc-card uc-card--accent">
    <strong>Teste 1</strong>
    <span class="uc-muted">10 de dezembro, 14h00, anfiteatro B.</span>
  </div>
</div>
```

### Caixa de destaque

`uc-callout` para uma nota que interrompe o texto: um pré-requisito, uma regra, um aviso. Uma ou duas por página; se tudo está numa caixa, nada se destaca. `uc-callout--warning` fica para o que tem consequências (prazos, inscrições, avaliação).

Exemplo (caixa normal e caixa de aviso), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/styles/callout.html):

```html
<div class="uc-callout">
  <strong>Antes da primeira aula prática</strong>
  <p>Instalar o JDK 21 e o editor indicado no guião 1. Os computadores do laboratório já os têm.</p>
</div>
<div class="uc-callout uc-callout--warning">
  <strong>Inscrição no teste</strong>
  <p>Só fazem o teste os estudantes inscritos até 5 de dezembro.</p>
</div>
```

### Tabela

`uc-table` quando cada item tem os mesmos campos e faz sentido comparar por coluna: componentes da avaliação, horários, notas mínimas. Se só há duas colunas e a segunda é texto longo, uma lista lê-se melhor. Num ecrã estreito a tabela desliza na horizontal sem alargar a página.

Exemplo (tabela de avaliação), [demonstração ao vivo](https://uc-design-kit.miguelrocha.dev/docs/demos/styles/table.html):

```html
<div class="uc-table">
  <table>
    <caption class="uc-visually-hidden">Componentes da avaliação</caption>
    <thead>
      <tr><th scope="col">Componente</th><th scope="col">Peso</th><th scope="col">Nota mínima</th><th scope="col">Data</th></tr>
    </thead>
    <tbody>
      <tr><td>Projeto 1</td><td>20%</td><td>—</td><td>28 nov</td></tr>
      <tr><td>Projeto 2</td><td>20%</td><td>—</td><td>9 jan</td></tr>
      <tr><td>Teste ou exame</td><td>60%</td><td>8,0</td><td>10 dez ou jan</td></tr>
    </tbody>
  </table>
</div>
```

Os outros blocos (listas de links, atalhos, listas de verificação) estão em [Blocos: superfícies e listas](https://uc-design-kit.miguelrocha.dev/docs/pt/estilos/superficies.md).
