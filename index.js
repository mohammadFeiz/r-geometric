export default class RGeometric{
  constructor(){
    this.getAvg = (arr)=>{
      var x = 0,y = 0,length = arr.length;
      for(var i = 0; i < length; i++){ x += arr[i][0]; y += arr[i][1]; }
      return [x / length,y / length]
    }

    this.getDip = (p1,p2,prep)=>{
      var dip = (p1[1] - p2[1]) / (p1[0] - p2[0]); 
      dip = prep?-1/dip:dip;
      if(dip === -Infinity){dip = Math.abs(Infinity)} 
      return dip;
    } 

    this.getArcBy3Points = (p1,p2,p3)=>{  
      var meet = this.getMeet(this.getAvg([p1,p2]),this.getDip(p1,p2,true),this.getAvg([p2,p3]),this.getDip(p2,p3,true));  
      if(!meet){return false};
      var [x,y] = meet;
      var a1 = this.getAngle(meet,p1);
      var a2 = this.getAngle(meet,p2);
      var a3 = this.getAngle(meet,p3);
      if(a1 < a2 && a2 < a3){var slice = [a1,a3]}  
      else if(a2 < a3 && a3 < a1){var slice = [a1,a3]}
      else if(a3 < a1 && a1 < a2){var slice = [a1,a3]}
      else if(a3 < a2 && a2 < a1){var slice = [a3,a1]}
      else if(a1 < a3 && a3 < a2){var slice = [a3,a1]}
      else if(a2 < a1 && a1 < a3){var slice = [a3,a1]}
      else {var slice = [0,0]}
      return {x,y,r:this.getLength(p1,[x,y]),slice};
    }

    this.getLength = (p1,p2)=>{
      return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2))
    }

    this.getAngle = (a,b)=>{
      var deltaX = b[0] - a[0],deltaY = b[1] - a[1];
      var length = this.getLength(a,b);
      var angle = Math.acos(deltaX / this.getLength(a,b)) / Math.PI * 180;
      angle = Math.sign(deltaY) < 0?360 - angle:angle;
      return parseFloat(angle.toFixed(4));
    }

    this.getPointOfLine = (a,b,obj)=>{
      if(typeof a !== 'object' || typeof obj !== 'object'){return false}
      var typeB = typeof b;
      var dip = typeB === 'object'?this.getDip(a,b):b;
      var {x,y} = obj;  
      if(dip === Infinity){return y === undefined?false:[a[0],y]}
      if(dip === 0){return x === undefined?false:[x,a[1]]}
      if(x !== undefined){return [x,dip * (x - a[0]) + a[1]]}
      if(y !== undefined){return [(y - a[1]) / dip + a[0],y]}
      return false;
    }

    this.getMeet = (a1,a2,b1,b2)=>{ 
      if(!Array.isArray(a1) || !Array.isArray(b1)){return false}
      var dip1 = Array.isArray(a2)?this.getDip(a1,a2):a2;
      var dip2 = Array.isArray(b2)?this.getDip(b1,b2):b2; 
      if(dip1 === dip2){return false}
      if(dip1 === Infinity){return this.getPointOfLine(b1,dip2,{x:a1[0]})}
      if(dip2 === Infinity){return this.getPointOfLine(a1,dip1,{x:b1[0]})}
      var x = ((dip1 * a1[0]) - (dip2 * b1[0]) + b1[1] - a1[1]) / (dip1 - dip2);
      var y = dip1 * (x - a1[0]) + a1[1];
      return [x,y]
    }

    this.divide = (p1,p2, count)=>{ 
      var deltaX = p2[0] - p1[0],deltaY = p2[1] - p1[1];
      var dX = deltaX / count,dY = deltaY / count;
      var points = [];
      for (var i = 1; i < count; i++) {
          points.push([i * dX + p1[0],i * dY + p1[1]]);
      }
      return points;    
    }

    this.getPrependicularPointToLine = (p1,p2, p)=>{
      var dip = this.getDip(p1,p2);
      var x,y;
      if (dip === 0) {y = p1[1]; x = p[0];} 
      else if (dip === Infinity) {y = p[1],x = p1[0];} 
      else {
        x = ((p[0] / dip) + (dip * p1[0]) + p[1] - p1[1]) / (dip + (1 / dip));
        y = (dip * x) - (dip * p1[0]) + p1[1];
      }
      return [x,y];
    }

    this.getPrependicularPointFromLine = (p1,p2,p,offset)=>{
      if(p === 'center'){p = this.getAvg(p1,p2)}
      else if(p === 'start'){p = p1;}
      else if(p === 'end'){p = p2;}
      if(!offset){return p;}
      var angle = this.getAngle(p1,p2);
      var deltaX = offset * Math.cos((angle - 90) * Math.PI / 180);
      var deltaY = offset * Math.sin((angle - 90) * Math.PI / 180);
      return {x:p[0] + deltaX,y:p[1] + deltaY,deltaX,deltaY}
    }

    this.getParallelLine = (points,offset,close)=>{
      var lines = [];
      var length = points.length;
      close = length < 3?false:close;
      for(var i = 0; i < length; i++){
          if(i === 0 && !close){continue;}
          var point = points[i];
          var beforePoint = points[i - 1] || points[length - 1]; 
          var {deltaX,deltaY} = this.getPrependicularPointFromLine(beforePoint,point,'start',offset,);
          lines.push([
            [beforePoint[0] + deltaX,beforePoint[1] + deltaY,beforePoint[2]?(beforePoint[2] + offset < 0?0:beforePoint[2] + offset):undefined],  
            [point[0] + deltaX,point[1] + deltaY,point[2]?(point[2] + offset < 0?0:point[2] + offset):undefined],
          ]);
      }
      var points = [];
      length = lines.length;
      for(var i = 0; i < length; i++){
          var line = lines[i];
          var beforeLine = false;
          if(i === 0){beforeLine = close?lines[length - 1]:false;}
          else{beforeLine = lines[i - 1]}
          var beforeMeet = beforeLine?this.getMeet(beforeLine[0],beforeLine[1],line[0],line[1]):false;
          line[0][0] = beforeMeet?beforeMeet[0]:line[0][0];
          line[0][1] = beforeMeet?beforeMeet[1]:line[0][1];
          points.push(line[0]);
          if(i === length - 1 && !close){points.push(line[1]);}
      } 
      return points;
    }

    this.getLineBySLA = (p1,length,angle)=>{
      return [p1,[p1[0]+(Math.cos(angle * Math.PI / 180) * length),p1[1] + (Math.sin(angle * Math.PI / 180) * length)]];
    }

    this.shiftLine = (p1,p2,value)=>{
      if(value === 0){return {p1,p2}}
      var angle,line,deltaX,deltaY;
      var length = this.getLength(p1,p2);
      if(value > 0){
        angle = this.getAngle(p1,p2);
        line = this.getLineBySLA(p1,length + value,angle);  
        deltaX = line.p2[0] - p2[0];
        deltaY = line.p2[1] - p2[1];
      }
      else{
        angle = this.getAngle(p2,p1);
        line = this.getLineBySLA(p2,length + Math.abs(value),angle);  
        deltaX = line.p2[0] - p1[0];
        deltaY = line.p2[1] - p1[1];
      }
      return [[p1[0] + deltaX,p1[1] + deltaY],[p2[0] + deltaX,p2[1] + deltaY]]
    }
    this.setLineLength = (p1,p2,length,position = 'center')=>{
      if(position === 'end'){
        var angle = this.getAngle(p1,p2);
        var newLine = this.getLineBySLA(p1,length,angle);
        return {p1,p2:newLine.p2}
      }
      if(position === 'start'){
        var angle = this.getAngle(p2,p1);
        var newLine = this.getLineBySLA(p2,length,angle);
        return {p1:newLine.p2,p2}
      }
      var avg = this.getAvg([p1,p2]);
      var endAngle = this.getAngle(avg,p2);
      var endNewLine = this.getLineBySLA(avg,length / 2,endAngle);
      var startAngle = this.getAngle(avg,p1);
      var startNewLine = this.getLineBySLA(avg,length / 2,startAngle);
      return {p1:startNewLine.p2,p2:endNewLine.p2}
    }
    this.rotatePoints = (points,angle,center)=>{
      var Points = [];
      for(var i = 0; i < points.length; i++){
        var p = points[i];
        var originalAngle = this.getAngle(center,p);
        var Angle = originalAngle + angle;
        Points.push(this.rotatePoint(p,Angle,center)) 
      }
      return Points
    }
    this.rotatePoint = (p,angle,center,offset)=>{
      if(offset){
        var originalAngle = this.getAngle(center,p);
        angle += originalAngle;
      }
      var length = this.getLength(center,p);
      var line = this.getLineBySLA(center,length,angle);
      return line.p2;
    }
    this.getDistanceOfPointAndLine = (p1,p2,p)=>{
      var point = this.getPrependicularPointToLine(p1,p2,p);
      return this.getLength(p,point);
    }
    this.setDistanceOfPointFromLine = (p1,p2,p,distance)=>{
      var prep = this.getPrependicularPointToLine(p1,p2,p);
      return this.getPrependicularPointFromLine(p1,p2,prep,distance)
    }
  }
}
const {
  getAvg,getDip,getArcBy3Points,getLength,getAngle,getPointOfLine,
  getMeet,divide,getPrependicularPointToLine,getPrependicularPointFromLine,getParallelLine,getLineBySLA,shiftLine,setLineLength,rotatePoints,rotatePoint,getDistanceOfPointAndLine,setDistanceOfPointFromLine
} = new RGeometric();
  
export {
  getAvg,getDip,getArcBy3Points,getLength,getAngle,getPointOfLine,
  getMeet,divide,getPrependicularPointToLine,getPrependicularPointFromLine,getParallelLine,getLineBySLA,shiftLine,setLineLength,rotatePoints,rotatePoint,getDistanceOfPointAndLine,setDistanceOfPointFromLine
}