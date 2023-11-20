const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 18;
const cellsVertical = 17;
const width = window.innerWidth;
const height = window.innerHeight-5;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];
World.add(world, walls);

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

console.log(startRow, startColumn);

const stepThroughCell = (row, column) => {
  //// if i already visited the cell then return
  if (grid[row][column]) {
    return;
  }

  //// Mark this cell as visited
  grid[row][column] = true;

  /// Assemble randomly ordered list of neighbors,  randomly sort this list for random maze
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left'],
  ]);

  //// For each neighbors......
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    //// See if that neighbor out of bound
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue; //// means do not anything for the current iteration but the loop must go on
    }

    //// if we have visited the neighbor, continue to the next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    //// removes the wall either horizontals or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    ////recursion this will create actual maze go see verticals/horizontals have true/false for(1,1) starting point values manually check it
    stepThroughCell(nextRow, nextColumn);

    //// visit the next cell
  }
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    } else {
      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX / 2,
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        6,
        {
          label: 'wall',
          isStatic: true,
          render: {
            fillStyle: 'red',
          },
        }
      );
      World.add(world, wall);
    }
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    } else {
      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX,
        rowIndex * unitLengthY + unitLengthY / 2,
        6,
        unitLengthY,
        {
          label: 'wall',
          isStatic: true,
          render: {
            fillStyle: 'red',
          },
        }
      );
      World.add(world, wall);
    }
  });
});

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: 'green',
    },
  }
);

World.add(world, goal);

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: 'ball',
  render: {
    fillStyle: 'teal',
  },
});

World.add(world, ball);

// Touch controls for mobile devices
const touchControls = {
  startX: 0,
  startY: 0,
};

document.addEventListener('touchstart', (event) => {
  touchControls.startX = event.touches[0].clientX;
  touchControls.startY = event.touches[0].clientY;
});

document.addEventListener('touchmove', (event) => {
  const deltaX = event.touches[0].clientX - touchControls.startX;
  const deltaY = event.touches[0].clientY - touchControls.startY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    Body.setVelocity(ball, { x: deltaX > 0 ? 3 : -3, y: 0 });
  } else {
    // Vertical swipe
    Body.setVelocity(ball, { x: 0, y: deltaY > 0 ? 3 : -3 });
  }
});

document.addEventListener('keydown', (event) => {
  const {x,y} = ball.velocity
  console.log(x, y)
  
////'Move up'
if (event.key === 'w') {
  if (y > -10) {
      Body.setVelocity(ball, { x, y: Math.max(y - 3, -7) });
  }
}

//// 'Move right'
else if (event.key === 'd') {
  if (x < 10) {
      Body.setVelocity(ball, { x: Math.min(x + 3, 7), y });
  }
}

//// 'Move down'
else if (event.key === 's') {
  if (y < 10) {
      Body.setVelocity(ball, { x, y: Math.min(y + 3, 7) });
  }
}

////'Move left'
else if (event.key === 'a') {
  if (x > -10) {
      Body.setVelocity(ball, { x: Math.max(x - 3, -7), y });
  }
}

});

// Win condition && when u simply do console.log(event) then u will see that there is nothing in pairs array because then the event occurs then it will wipe out all the properties if u look in the console it will empty array so do forEach
// to identify the collision just give them label property above
Events.on(engine, 'collisionStart', (event) => {
  // console.log(event)
  event.pairs.forEach((collision) => {
    // console.log(collision)
    const lables = ['ball', 'goal'];
    if (lables.includes(collision.bodyA.label) && lables.includes(collision.bodyB.label)) {
      document.querySelector('.winner').classList.remove('hidden');
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
