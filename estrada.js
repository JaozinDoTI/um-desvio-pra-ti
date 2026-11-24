(() => {
  const viagem = document.querySelector('.viagem');
  const cenas = [...document.querySelectorAll('[data-cena]')];
  const paradas = [...document.querySelectorAll('.andamento-tracos i')];
  const terreno = document.querySelector('#terreno');
  const marcador = document.querySelector('#marcador');
  const dicaMapa = document.querySelector('#dica-mapa');
  const ir = document.querySelector('#avancar');
  const voltar = document.querySelector('#voltar');
  const recomecar = document.querySelector('#recomecar');
  const mirante = document.querySelector('#mirante');
  const tituloMirante = document.querySelector('#titulo-mirante');
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rotulos = ['Itá', 'Primeira curva', 'Segunda curva', 'Floripa'];
  const proximasAcoes = ['Pegar a estrada', 'Seguir viagem', 'Chegar ao mirante', 'Ler o recado'];

  const trechos = [...document.querySelectorAll('.estrada-feita use')].map((linha) => {
    const caminho = document.querySelector(linha.getAttribute('href'));
    const tamanho = caminho.getTotalLength();
    const amostras = Array.from({ length: 101 }, (_, indice) => caminho.getPointAtLength(tamanho * indice / 100));
    linha.style.strokeDasharray = `${tamanho} ${tamanho}`;
    return { linha, caminho, tamanho, amostras };
  });

  let parada = 0;
  let percurso = 0;
  let quadro = 0;
  let gesto = null;

  function desenharRota(posicao) {
    percurso = posicao;
    const indice = Math.min(Math.floor(posicao), trechos.length - 1);
    const { caminho, tamanho } = trechos[indice];
    const ponto = caminho.getPointAtLength(tamanho * (posicao - indice));
    marcador.style.left = `${ponto.x / 680 * 100}%`;
    marcador.style.top = `${ponto.y / 560 * 100}%`;

    trechos.forEach(({ linha, tamanho }, numero) => {
      const proporcao = Math.min(1, Math.max(0, posicao - numero));
      linha.style.visibility = proporcao > 0 ? 'visible' : 'hidden';
      linha.style.strokeDashoffset = tamanho * (1 - proporcao);
    });
  }

  function levarA(elemento) {
    elemento.scrollIntoView({ behavior: reduzirMovimento.matches ? 'instant' : 'smooth', block: 'start' });
  }

  function mostrarParada(indice, moverFoco = false) {
    parada = indice;
    const chegou = parada === trechos.length;
    const cenaAtual = cenas[Math.min(parada, cenas.length - 1)];

    cenas.forEach((cena) => {
      cena.classList.remove('entrando');
      cena.toggleAttribute('inert', cena !== cenaAtual);
    });
    if (moverFoco && !chegou) cenaAtual.classList.add('entrando');

    ir.textContent = proximasAcoes[parada];
    voltar.hidden = parada === 0;
    dicaMapa.hidden = chegou;
    marcador.hidden = chegou;
    paradas.forEach((traco, numero) => traco.classList.toggle('atingido', numero <= parada));
    document.querySelector('#estado').textContent = `${rotulos[parada]} · ${parada + 1} de ${paradas.length}`;
    mirante.hidden = !chegou;

    if (!moverFoco) return;
    if (chegou) {
      mirante.classList.add('entrando');
      tituloMirante.focus({ preventScroll: true });
      levarA(mirante);
      return;
    }

    const titulo = cenaAtual.querySelector('h1, h2');
    titulo.focus({ preventScroll: true });
  }

  function definirEmMovimento(emMovimento) {
    ir.setAttribute('aria-disabled', String(emMovimento));
    voltar.disabled = emMovimento;
  }

  function dirigirA(destino) {
    if (quadro || gesto) return;
    const origem = percurso;
    const duracao = Math.max(210, 950 * Math.abs(destino - origem));
    const inicio = performance.now();

    function terminar() {
      quadro = 0;
      definirEmMovimento(false);
      desenharRota(destino);
      if (destino !== parada) mostrarParada(destino, true);
    }

    function passo(agora) {
      const tempo = Math.max(0, (agora - inicio) / duracao);
      if (tempo >= 1 || reduzirMovimento.matches) {
        terminar();
        return;
      }
      const suave = tempo * tempo * (3 - 2 * tempo);
      desenharRota(origem + (destino - origem) * suave);
      quadro = requestAnimationFrame(passo);
    }

    if (reduzirMovimento.matches) {
      terminar();
      return;
    }
    definirEmMovimento(true);
    quadro = requestAnimationFrame(passo);
  }

  ir.addEventListener('click', () => {
    if (parada < trechos.length) {
      dirigirA(parada + 1);
      return;
    }
    tituloMirante.focus({ preventScroll: true });
    levarA(mirante);
  });

  voltar.addEventListener('click', () => dirigirA(parada - 1));

  recomecar.addEventListener('click', () => {
    mirante.classList.remove('entrando');
    desenharRota(0);
    mostrarParada(0, true);
    levarA(viagem);
  });

  marcador.addEventListener('pointerdown', (evento) => {
    if (quadro || gesto || !evento.isPrimary || evento.button !== 0) return;
    marcador.setPointerCapture(evento.pointerId);
    gesto = { id: evento.pointerId, area: terreno.getBoundingClientRect() };
    definirEmMovimento(true);
  });

  marcador.addEventListener('pointermove', (evento) => {
    if (gesto?.id !== evento.pointerId) return;
    const { area } = gesto;
    const x = (evento.clientX - area.left) / area.width * 680;
    const y = (evento.clientY - area.top) / area.height * 560;
    let menorDistancia = Infinity;
    let maisProximo = 0;

    // O ponto percorre só o trecho entre a parada atual e a próxima.
    trechos[parada].amostras.forEach((ponto, indice) => {
      const distancia = (ponto.x - x) ** 2 + (ponto.y - y) ** 2;
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        maisProximo = indice;
      }
    });
    desenharRota(parada + maisProximo / 100);
  });

  function soltar(evento) {
    if (gesto?.id !== evento.pointerId) return;
    const avancou = evento.type === 'pointerup' && percurso >= parada + 0.65;
    gesto = null;
    dirigirA(parada + Number(avancou));
  }

  marcador.addEventListener('pointerup', soltar);
  marcador.addEventListener('pointercancel', soltar);
  marcador.addEventListener('lostpointercapture', soltar);

  viagem.classList.add('interativa');
  document.querySelector('#atalho').hidden = true;
  document.querySelector('#andamento').hidden = false;
  ir.hidden = false;
  recomecar.hidden = false;

  // Preserva o destino de um link direto e deixa a carta legível mesmo sem JavaScript.
  const inicio = location.hash === '#mirante' ? trechos.length : 0;
  desenharRota(inicio);
  mostrarParada(inicio);
})();
