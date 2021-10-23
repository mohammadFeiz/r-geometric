# r-geometric

### Installation

``` javascript
npm install r-geometric
```

### Use

``` javascript
import RGeometricObject from 'r-geometric';

const RGeometric = new RGeometricObject();

```

### getLength()
##### get line object as parameter and returns number as length of line.
``` javascript
let length = RGeometric.getLength({x1:10,y1:10,x2:20,y2:-40});
//returns 50.99019513592785
```
[![alt text](/images/getLength.jpg)]
### getAngle()
##### get line object as parameter and returns number as angle of line.
``` javascript
let angle = RGeometric.getAngle({x1:10,y1:10,x2:20,y2:-40});
//returns 281.309932
```
[![alt text](/images/getAngle.jpg)]
### getMeet()
##### get 2 lines object as parameters and returns number as meet point(array of 2 number) of lines.
``` javascript
let meet = RGeometric.getMeet({x1:10,y1:10,x2:20,y2:-40},{x1:100,y1:-10,x2:40,y2:50});
//returns [-7.5, 97.5]
```
[![alt text](/images/getMeet.jpg)]
### getPrepToLine()
##### get a line object and a point array as parameters and returns a point array as prependicular from point to line.
``` javascript
let prep = RGeometric.getPrepToLine({x1:10,y1:10,x2:20,y2:-40},[-60,-40]);
//returns [x, y]
```
[![alt text](/images/getPrepToLine.jpg)]
### getXOnLineByY()
##### get a line object and x value as parameters and returns a number as y .
``` javascript
let x = RGeometric.getXOnLineByY({x1:10,y1:10,x2:20,y2:-40},20);
//returns y
```
[![alt text](/images/getXOnLineByY.jpg)]
### getYOnLineByX()
##### get a line object and y value as parameters and returns a number as x .
``` javascript
let y = RGeometric.getYOnLineByX({x1:10,y1:10,x2:20,y2:-40},20);
//returns y
```
[![alt text](/images/getYOnLineByX.jpg)]
### getLineBySLA()
##### get a point array and length value and angle as parameters and returns a line object .
##### in this example this function returns a line object by start from 0,0 and length equal 20 and angle equal 45.
``` javascript
let y = RGeometric.getYOnLineByX([0,0],20,45);
//returns {x1:...,y1:...,x2:...,y2:...}
```
[![alt text](/images/getLineBySLA.jpg)]
### getPointsByDivide()
##### get a line object and divide value as parameters and returns midpoints array .
##### in this example , This function divides the line into 6 equal parts by return 5 mid points.
``` javascript
let midPoints = RGeometric.getPointsByDivide({x1:0,y1:0,x2:100,y2:60},6);
//returns [[x,y],[x,y],[x,y],[x,y],[x,y]]
```
[![alt text](/images/getPointsByDivide.jpg)]
