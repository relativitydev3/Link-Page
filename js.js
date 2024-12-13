// Configuración de la animación
const CONFIG = {
  confetti: {
    count: 20,
    gravity: 0.3,
    drag: 0.075,
    colors: [
      { front : '#7b5cff', back: '#6245e0' }, // Purple
      { front : '#b3c7ff', back: '#8fa5e5' }, // Light Blue
      { front : '#5c86ff', back: '#345dd1' }  // Darker Blue
    ]
  },
  sequins: {
    count: 10,
    gravity: 0.55,
    drag: 0.02
  },
  terminalVelocity: 3
};

// Cache de elementos DOM
const elements = {
  button: document.getElementById('button'),
  canvas: document.getElementById('canvas'),
  get ctx() { return this.canvas.getContext('2d') }
};

// Estado global
let disabled = false;
let confetti = [];
let sequins = [];

// Funciones utilitarias
const utils = {
  randomRange: (min, max) => Math.random() * (max - min) + min,
  
  initConfettoVelocity: (xRange, yRange) => {
    const x = utils.randomRange(xRange[0], xRange[1]);
    const range = yRange[1] - yRange[0] + 1;
    let y = yRange[1] - Math.abs(utils.randomRange(0, range) + utils.randomRange(0, range) - range);
    if (y >= yRange[1] - 1) {
      y += (Math.random() < .25) ? utils.randomRange(1, 3) : 0;
    }
    return {x: x, y: -y};
  }
};

// Clase Confetto optimizada
function Confetto() {
  this.randomModifier = utils.randomRange(0, 99);
  this.color = CONFIG.confetti.colors[Math.floor(utils.randomRange(0, CONFIG.confetti.colors.length))];
  this.dimensions = {
    x: utils.randomRange(5, 9),
    y: utils.randomRange(8, 15),
  };
  this.position = {
    x: utils.randomRange(elements.canvas.width/2 - elements.button.offsetWidth/4, elements.canvas.width/2 + elements.button.offsetWidth/4),
    y: utils.randomRange(elements.canvas.height/2 + elements.button.offsetHeight/2 + 8, elements.canvas.height/2 + (1.5 * elements.button.offsetHeight) - 8),
  };
  this.rotation = utils.randomRange(0, 2 * Math.PI);
  this.scale = { x: 1, y: 1 };
  this.velocity = utils.initConfettoVelocity([-9, 9], [6, 11]);
}

Confetto.prototype.update = function() {
  this.velocity.x -= this.velocity.x * CONFIG.confetti.drag;
  this.velocity.y = Math.min(this.velocity.y + CONFIG.confetti.gravity, CONFIG.terminalVelocity);
  this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
  
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
};

// Clase Sequin optimizada
function Sequin() {
  this.color = CONFIG.confetti.colors[Math.floor(utils.randomRange(0, CONFIG.confetti.colors.length))].back;
  this.radius = utils.randomRange(1, 2);
  this.position = {
    x: utils.randomRange(elements.canvas.width/2 - elements.button.offsetWidth/3, elements.canvas.width/2 + elements.button.offsetWidth/3),
    y: utils.randomRange(elements.canvas.height/2 + elements.button.offsetHeight/2 + 8, elements.canvas.height/2 + (1.5 * elements.button.offsetHeight) - 8),
  };
  this.velocity = {
    x: utils.randomRange(-6, 6),
    y: utils.randomRange(-8, -12)
  };
}

Sequin.prototype.update = function() {
  this.velocity.x -= this.velocity.x * CONFIG.sequins.drag;
  this.velocity.y = this.velocity.y + CONFIG.sequins.gravity;
  
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
};

// Funciones principales
function initBurst() {
  for (let i = 0; i < CONFIG.confetti.count; i++) {
    confetti.push(new Confetto());
  }
  for (let i = 0; i < CONFIG.sequins.count; i++) {
    sequins.push(new Sequin());
  }
}

function render() {
  elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
  
  confetti.forEach((confetto, index) => {
    let width = (confetto.dimensions.x * confetto.scale.x);
    let height = (confetto.dimensions.y * confetto.scale.y);
    
    elements.ctx.translate(confetto.position.x, confetto.position.y);
    elements.ctx.rotate(confetto.rotation);

    confetto.update();
    
    elements.ctx.fillStyle = confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;
    elements.ctx.fillRect(-width / 2, -height / 2, width, height);
    
    elements.ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (confetto.velocity.y < 0) {
      elements.ctx.clearRect(
        elements.canvas.width/2 - elements.button.offsetWidth/2,
        elements.canvas.height/2 + elements.button.offsetHeight/2,
        elements.button.offsetWidth,
        elements.button.offsetHeight
      );
    }
  });

  sequins.forEach((sequin, index) => {  
    elements.ctx.translate(sequin.position.x, sequin.position.y);
    
    sequin.update();
    
    elements.ctx.fillStyle = sequin.color;
    elements.ctx.beginPath();
    elements.ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI);
    elements.ctx.fill();

    elements.ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (sequin.velocity.y < 0) {
      elements.ctx.clearRect(
        elements.canvas.width/2 - elements.button.offsetWidth/2,
        elements.canvas.height/2 + elements.button.offsetHeight/2,
        elements.button.offsetWidth,
        elements.button.offsetHeight
      );
    }
  });

  confetti = confetti.filter(confetto => confetto.position.y < elements.canvas.height);
  sequins = sequins.filter(sequin => sequin.position.y < elements.canvas.height);

  window.requestAnimationFrame(render);
}

function clickButton() {
  if (!disabled) {
    disabled = true;
    elements.button.classList.add('loading');
    elements.button.classList.remove('ready');
    
    setTimeout(() => {
      elements.button.classList.add('complete');
      elements.button.classList.remove('loading');
      
      setTimeout(() => {
        initBurst();
        setTimeout(() => {
          disabled = false;
          elements.button.classList.add('ready');
          elements.button.classList.remove('complete');
        }, 4000);
      }, 320);
    }, 1800);
  }
}

// Manejadores de eventos
function resizeCanvas() {
  elements.canvas.width = window.innerWidth;
  elements.canvas.height = window.innerHeight;
}

// Inicialización
window.addEventListener('resize', resizeCanvas);
document.body.onkeyup = (e) => {
  if (e.keyCode == 13 || e.keyCode == 32) {
    clickButton();
  }
};

// Configuración inicial del texto del botón
const textElements = elements.button.querySelectorAll('.button-text');
textElements.forEach(element => {
  const characters = element.innerText.split('');
  const characterHTML = characters
    .map((letter, index) => 
      `<span class="char${index}" style="--d:${index * 30}ms; --dr:${(characters.length - index - 1) * 30}ms;">${letter}</span>`
    )
    .join('');
  element.innerHTML = characterHTML;
});

// Iniciar la animación
initBurst();
resizeCanvas();
render();