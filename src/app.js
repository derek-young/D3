var board = {
  width: 700,
  height: 450
}

var collider = {
  stats: {score: 0, highScore: ''},
};

collider.updateScore = function() {
  d3.select('#high-score')
    .text(collider.stats.highScore);
  d3.select('#current-score')
    .text(collider.stats.score);
};

collider.increaseScore = function () {
  collider.stats.score += 1;
  collider.updateScore();
};

collider.initEnemies = function(n) {
  d3.select('svg').selectAll('.enemy')
    .data(initialData(n))
    .enter().append('circle')
      .attr('class', 'enemy')
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; })
      .attr('r', 10);
};

collider.initPlayer = function() {
  var boardW = board.width;
  var boardH = board.height;
  var drag = d3.drag()
    .on('drag', function(d) {
      d.x += d3.event.dx
      d.y += d3.event.dy
      d3.select(this).attr('transform', function(d,i){
        var margin = 20;
        var newX = d.x;
        var newY = d.y;
        if (newX < margin) newX = margin;
        if (newY < margin) newY = margin;
        if (newX > boardW - margin) newX = boardW - margin;
        if (newY > boardH - margin) newY = boardH - margin;
        return 'translate(' + [newX, newY] + ')'
      })
    });

  d3.select('svg')
    .append('g')
      .data([{x: (boardW / 2), y: (boardH / 2)}])
        .attr('transform', 'translate(' + (boardW / 2) + ',' + (boardH / 2) + ')')
        .call(drag);

  d3.select('g')
    .append('circle')
      .attr('class', 'player')
      .attr('r', 10);
}

collider.init = function(n) {
  collider.initPlayer();
  collider.initEnemies(n);
  collider.updateScore();
  setTimeout(function() {
    setInterval(collider.increaseScore, 50);
  }, 2000);
  setInterval(shuffle, 2000);
};

window.onload = collider.init(32);



/* Helper Functions */

function shuffle() {
  var nEnemies = d3.select('svg').selectAll('.enemy').size();
  d3.select('svg').selectAll('.enemy').data(randomData(nEnemies))
  .transition().duration(1500).tween('custom', collisionDetection)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}

function move(x, y) {
  d3.select('svg').selectAll('.enemy').data([{x: x, y: y}])
  .transition().duration(1500).tween('custom', collisionDetection)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}

function initialData(n) {
  var data = [];
  var x, y;

  for (var i = n; i > 0; i--) {
    if (i > n / 2) {
      x = ((n % i) * (board.width / (n / 2))) + 10;
      y = 0;
    } else {
      x = ((i - 1) * (board.width / (n / 2))) + 10;
      y = board.height;
    }
    var circle = new Circle(x, y);
    data.push(circle);
  }
  return data;
}

function randomData(n) {
  var data = [];
  var x, y;

  for (var i = n; i > 0; i--) {
    x = randomNum(board.width);
    y = randomNum(board.height);
    var circle = new Circle(x, y);
    data.push(circle);
  }
  return data;
}

function checkCollision(enemy) {

  return d3.selectAll('.player').each(function(player) {
    console.log(player.x, 'player x');
    console.log(enemy.attr('cx'), 'enemy x');
    var xDiff = parseFloat(enemy.attr('cx')) - player.x;
    var yDiff = parseFloat(enemy.attr('cy')) - player.y;
    var distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    console.log(distance);
    if (distance < 20) return onCollision();
  });
}

function collisionDetection(endData) {
  var enemy = d3.select(this);
  var enemyStart = {
    x: parseFloat(enemy.attr('cx')),
    y: parseFloat(enemy.attr('cy'))
  };
  var enemyEnd = {
    x: endData.x,
    y: endData.y
  };
  return function(time) {
    checkCollision(enemy);
    var enemyNextPos = {
      x: enemyStart.x + (enemyEnd.x - enemyStart.x) * time,
      y: enemyStart.y + (enemyEnd.y - enemyStart.y) * time
    };
    return enemy.attr('cx', enemyNextPos.x).attr('cy', enemyNextPos.y);
  };
}

function onCollision() {
  updateHighScore();
  collider.stats.score = 0;
  return collider.updateScore();
}

function updateHighScore() {
  if (collider.stats.score > collider.stats.highScore) {
    collider.stats.highScore = collider.stats.score;
  }
}

function Circle(x, y) {
  this.x = x;
  this.y = y;
}

function randomNum(range) {
  return Math.random() * range;
}
