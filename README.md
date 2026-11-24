# Um desvio pra ti

Uma homenagem de aniversário em forma de estrada de Itá a Florianópolis. O visitante pode avançar pelos botões ou arrastar o marcador pelas curvas até encontrar o cartão no mirante.

## Abrir e editar

Abra `index.html` no navegador. Para testar por HTTP, rode `python -m http.server 8000` na raiz e abra `http://localhost:8000/`.

- `index.html` guarda os recados, a assinatura e a imagem do cartão.
- `estilo.css` reúne as cores, o layout e as animações.
- `estrada.js` controla a viagem. Os textos dos botões e o andamento ficam no início do arquivo.
- `assets/` guarda o mapa, a foto da família, a capa de compartilhamento e o favicon.

## GitHub Pages

Envie os arquivos da raiz para a branch `main` do novo repositório público. Em **Settings → Pages**, selecione **Deploy from a branch**, `main` e `/ (root)`. Depois do build, confirme que o site e `assets/capa.jpg` abrem pelo endereço do Pages. Se o endereço mudar, atualize os campos `og:url` e `og:image` de `index.html`.

O projeto é estático e usa HTML, CSS e JavaScript sem build. O contorno de Santa Catarina é baseado na [malha territorial do IBGE](https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/15774-malhas.html). As curvas são ilustrativas. A foto da homenagem e os dados cartográficos têm seus direitos próprios.

## Referências e licença

- [The Wild Path, Codrops](https://tympanus.net/Development/StorytellingMap/) inspirou a ligação entre o traçado e as etapas da história.
- [San Rita, Codrops](https://tympanus.net/codrops/2026/03/24/digital-craft-wild-soul-building-san-ritas-topographic-web-experience/) foi uma referência visual para a cartografia.
- [SVG Interactive Roadtrip Map, Dudley Storey](https://codepen.io/dudleystorey/pen/zKBVPm) mostrou como sinalizar paradas na própria rota.

O código original é distribuído sob a licença MIT. As referências serviram de inspiração visual e de interação.
