
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var rect = canvas.getBoundingClientRect();

var orbs = [];
var qt = new Quadtree();

function Orb(x, y) {
  this.x = x;
  this.y = y;
  this.vx = randomDirect();
  this.vy = Math.sqrt(144 - this.vx ** 2 );
  this.hit = false;
  this.color = "#FFFFFF"
  this.draw = function() {
    if ( !this.hit ) {
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(this.x, this.y, 10, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
    } else {
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(this.x, this.y, 10, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
    }
  };

  this.move = function() {
    this.x = this.x + this.vx/3
    this.y = this.y + this.vy/3
    if ( this.x <= 10 || this.x >= 790) {
       this.vx = -this.vx;
    } else if ( this.y <= 10 || this.y >= 790) {
       this.vy = -this.vy;
    }
  };
};

function Quadtree(boundaries, level, max_subLvl) {
  this.max_obj = 5;
  this.max_sub = max_subLvl || 4;
  this.objects = []; //stores orbs
  this.lvl = level || 0;
  this.bounds = boundaries || {x:0, y:0, width:800, height:800};
  this.subLvl = []; //stores more quadtrees

  this.clear = function() {
    this.objects = [];
    for(var i=0; i<this.subLvl.length; i++){
      if(typeof(this.subLvl[i]) !== "undefined") {
        this.subLvl[i].clear();
      }
    }
    this.subLvl = [];
  };

  this.split = function() {
    var subLvl = this.lvl + 1;
    var subWidth = Math.round(this.bounds.width / 2);
    var subHeight = Math.round(this.bounds.height / 2);
    var x = this.bounds.x;
    var y = this.bounds.y;

    // first quadrant
    this.subLvl[0] = new Quadtree({
      x: x + subWidth,
      y: y,
      width: subWidth,
      height: subHeight}, subLvl, this.max_sub);

    //second quadrant
    this.subLvl[1] =  new Quadtree({
      x: x,
      y: y,
      width: subWidth,
      height: subHeight}, subLvl, this.max_sub);

    // third quadrant
    this.subLvl[2] = new Quadtree({
      x: x,
      y: y + subHeight,
      width: subWidth,
      height: subHeight}, subLvl, this.max_sub);

    //fourth quadrant
    this.subLvl[3] = new Quadtree({
      x: x + subWidth,
      y: y + subHeight,
      width: subWidth,
      height: subHeight}, subLvl, this.max_sub);
    };

  this.getIndex = function( orb ) {
    //determines the objects node, returns -1 if it cannot be fitted
    var index = -1;
    var vertical = this.bounds.x + (this.bounds.width / 2);
    var horizontal = this.bounds.y + (this.bounds.height / 2);

    var upper = (orb.y < horizontal);
    var lower = (orb.y > horizontal);

    if( orb.x < vertical) {
      if( upper ) {
        index = 1;
      } else if ( lower ) {
        index = 2;
      }
    } else if ( orb.x > vertical ) {
      if( upper ) {
        index = 0;
      } else if( lower ) {
        index = 3;
      }
    }

    return index;
  };

  this.insert = function( orb ) {
    var i = 0;
    var index;

    if( typeof this.subLvl[0] !== "undefined" ) {
      index = this.getIndex( orb );
        if( index !== -1 ) {
          this.subLvl[index].insert( orb );
          return;
        }
    }

    this.objects.push( orb );
    if ( this.object.length > this.max_obj && this.lvl < this.max_subLvl) {
      if( typeof this.subLvl[0] === "undefined" ) {
        this.split();
      }

      while( i < this.objects.length ) {
        index = this.getIndex( this.objects[i] );
        if( index !== -1 ) {
          this.subLvl[index].insert( this.objects.splice(i, 1)[0] );
        } else {
          i++;
        }
      }
    }
  };


  this.retrieve = function( orb ) {
    var index = this.getIndex( orb ),
    returnObj = this.objects;

    //if subLevels
    if( typeof this.subLvl[0] !== "undefined" ) {
      if( index !== -1 ) {
        returnObj = returnObj.concat( this.subLvl[index].retrieve( orb ) );
      } else {
        for( var i=0; i < this.subLvl.length; i++ ) {
          returnObj = returnObj.concat( this.subLvl[i].retrieve( orb ) );
        }
      }
    }

    return returnObj;
  };


};

function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

function randomDirect() {
  var num = Math.floor(Math.random() * 12) - 11;
  if ( num === 0) {
    return 5
  } else {
    return num;
  }
};

function addOrbs( num, start ) {
  orbs = [];
  for( var i=0; i<num; i++) {
    orbs.push(new Orb(randomInt(7) * randomInt(98) +12, randomInt(7) * randomInt(98) +12));
  }
  console.log(orbs);
};

function loadFrame(timestamp) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for(var i=0; i<orbs.length; i++) {
    orbs[i].move();
    detColl(orbs);
    orbs[i].draw();
  }
  requestAnimationFrame(loadFrame);
};

function pointDist(point1, point2) {
  return Math.sqrt( (point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2 );
};

function detColl(area) {
  for(var k = 0; k<area.length; k++){
    area[k].color = "#FFFFFF"
  };

  for(var i = 0; i<area.length; i++ ){
      for(var j = 0; j<area.length; j++ ){
        if ( i === j ) {
            continue;
        } else if ( Math.sqrt((area[i].x - area[j].x) ** 2 + (area[i].y - area[j].y) ** 2) <= 19 ) {
            area[i].color, area[j].color = "#FF0000";
        } else {
            continue;
        }
      }
  }
};


console.log(orbs);
