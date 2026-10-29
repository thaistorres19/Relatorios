# Dashboard OMOTOR

Dashboard estático com três visões independentes:

1. **Setembro** — chamados, tempos e uso do mês de setembro de 2026.
2. **Últimos 12 meses** — indicadores de outubro de 2025 a setembro de 2026.
3. **Mensagens por projeto** — seleção de período e dos 18 projetos detalhados na aba Uso por Projeto.

## Abrir no computador

Extraia o ZIP mantendo as pastas e abra `index.html` no navegador. Não é necessário instalar Node, Python ou um banco de dados. Mantenha `styles.css`, `app.js` e `report-data.js` junto ao HTML.

## Colocar no GitHub

1. No GitHub, crie um repositório chamado, por exemplo, `dashboard-omotor`.
2. Comece com a opção **Private**, pois os arquivos incluem dados operacionais e nomes de clientes.
3. Use **Add file → Upload files** e envie o conteúdo desta pasta, preservando os nomes dos arquivos.
4. Confirme o envio com **Commit changes**.

O arquivo `index.html` deve ficar na raiz do repositório. Não envie apenas o ZIP: extraia os arquivos antes do upload. Guardar o código no GitHub não publica automaticamente um site.

## Publicar um link com GitHub Pages

Esta etapa é opcional. Os dados presentes em `report-data.js` ficam disponíveis a quem puder acessar o site. O pacote não inclui autenticação ou controle de acesso.

**Repositório privado e site privado são configurações diferentes.** O GitHub Pages normalmente publica o site na internet mesmo quando o repositório é privado. O acesso privado a sites de projeto exige uma organização com GitHub Enterprise Cloud e configuração de visibilidade apropriada. No GitHub Free, o Pages exige repositório público. Não altere a visibilidade deste projeto apenas para habilitar a hospedagem dos dados reais.

Se os dados estiverem autorizados para publicação e o plano permitir Pages:

1. Abra **Settings → Pages** no repositório.
2. Em **Build and deployment**, selecione **Deploy from a branch**.
3. Selecione a branch `main` e a pasta **/(root)**.
4. Clique em **Save** e aguarde a publicação.
5. Use o endereço exibido em **Visit site**.

O arquivo `.nojekyll` indica que o site é estático e dispensa processamento por Jekyll. Se o upload pelo navegador não incluir esse arquivo oculto, crie um arquivo vazio com esse nome na raiz do repositório.

Para uso interno, mantenha o código privado e configure uma hospedagem com autenticação, ou Pages privado quando a organização tiver suporte. Uma senha escrita em JavaScript não protege os dados entregues ao navegador.

## O que editar

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Estrutura geral, navegação e carregamento dos arquivos. |
| `styles.css` | Cores, fontes, dimensões, espaçamentos e comportamento em telas menores. |
| `app.js` | Montagem dos indicadores, tabelas, abas e filtros. |
| `report-data.js` | Dados extraídos e conferidos do relatório fornecido. |

Os cards e tabelas são montados por JavaScript. Para alterações estruturais nesses elementos, edite as funções de apresentação em `app.js`; para aparência, comece por `styles.css`.

## Atualizar os dados

Esta entrega contém o retrato do arquivo **Relatório Setembro(1).xlsx**. Não há sincronização automática com Excel, upload de planilha ou atualização agendada.

Uma atualização deve substituir o conjunto correspondente em `report-data.js`, preservando sua estrutura, e conferir os rótulos de período em `app.js` e `index.html`. Os conjuntos `monthly`, `annual` e `projects` têm origens e escopos próprios. Um importador de novas planilhas pode ser acrescentado em uma próxima versão, com validação dos totais.

## Critérios preservados

- Os status correspondem à situação salva no arquivo, incluindo atualização em 01/10/2026. Não equivalem necessariamente ao fechamento em 30/09.
- Tempos são corridos, não horas de trabalho. A fonte não define metas de SLA.
- Usuários somados entre projetos ou meses não representam pessoas únicas no conjunto.
- O consolidado anual tem **19 projetos de uso**; a aba Uso por Projeto detalha **18**. Os totais não são intercambiáveis.
- Valores históricos não disponíveis permanecem como `null` e aparecem como **n.d.**.
- As divergências entre o total exportado e a soma dos projetos de setembro estão sinalizadas na interface.

## Referências de publicação

- [O que é GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Configurar a origem de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Visibilidade do site e acesso privado](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)

Publicado em https://thaistorres19.github.io/Relatorios/.

Os gráficos usam D3.js 7.9.0, carregado pela internet. A atualização inclui os destaques de incidentes e problemas, os gráficos por projeto e a matriz de atendimento revisada: 18 chamados finalizados em N2.

