Phygine
============

add some physical laws in your browser
Live exemple http://thomasbelin.fr

Create a place in your DOM where magic happens
-----------------
First create the place
```javascript
var containerDiv = document.getElementById('physical-container');
var container = new Phygine.PhysicalContainer(containerDiv);
```

Add some forces that apply on it
```javascript
container.addForce(new Phygine.Gravity({acceleration: new Phygine.Vect(0, 1)}));
container.addForce(new Phygine.Friction({acceleration: new Phygine.Vect(0.975, 0.975)}));
```

Add as many elements as you want, they will all be affected by the forces

```javascript
for(var i=0; i <= 4; i++) {
    var domElement = document.getElementById("element-"+i),
        xPosition = 4000,
        yPosition = 2500;
    var phyElement = new Phygine.PhysicalElement(domElement, {x:xPosition, y:yPosition});
    container.add(phyElement);

    //and if you want you can add a force that will only apply to this specific element
    var elasticOption = {
        position: { x: 100 + i * 100, y: 0 },
        size: 20
    };
    var elastic = new Phygine.Elastic(elasticOption);
    phyElement.addForce(elastic);
}
```

Run and enjoy
```Javascript
container.run();
```
