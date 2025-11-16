document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('levelsGrid');
  if (!container) return;

  // Número total de niveles
  var totalLevels = 5;

  // Estado de desbloqueo. Por ahora: solo nivel 1 desbloqueado.
  // En el futuro se puede guardar en localStorage para persistir.
  var unlocked = JSON.parse(localStorage.getItem('unlockedLevels')) || { 1: true };

  for (var i = 1; i <= totalLevels; i++) {
    var card = document.createElement('div');
    card.className = 'level-card';

    var number = document.createElement('div');
    number.className = 'level-number';
    number.textContent = i;

    var label = document.createElement('div');
    label.className = 'level-label';
    label.textContent = 'Nivel ' + i;

    card.appendChild(number);
    card.appendChild(label);

    var isUnlocked = !!unlocked[i];
    if (isUnlocked) {
      card.classList.add('unlocked');
      // Hacer clic para iniciar ese nivel
      (function (level) {
        card.addEventListener('click', function () {
          // Redirigir a la página principal pasando el nivel seleccionado
          window.location.href = 'index.html?level=' + level;
        });
      })(i);
    } else {
      card.classList.add('locked');
      var lock = document.createElement('div');
      lock.className = 'lock-icon';
      lock.textContent = '🔒';
      card.appendChild(lock);
    }

    container.appendChild(card);
  }
});
