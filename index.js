export default class RGeometric{
  constructor(){
    this.getAvg = (arr)=>{
      var x = 0,y = 0,length = arr.length;
      for(var i = 0; i < length; i++){ x += arr[i].x; y += arr[i].y; }
      return {x:x / length,y:y / length}
    }

    this.getDip = (p1,p2,prep)=>{
      var dip = (p1.y - p2.y) / (p1.x - p2.x); 
      dip = prep?-1/dip:dip;
      if(dip === -Infinity){dip = Math.abs(Infinity)} 
      return dip;
    } 

    this.getArcBy3Points = (p1,p2,p3)=>{  
      var meet = this.getMeet(this.getAvg([p1,p2]),this.getDip(p1,p2,true),this.getAvg([p2,p3]),this.getDip(p2,p3,true));  
      if(!meet){return false};
      var {x,y} = meet;
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
      return {x,y,r:this.getLength(p1,{x,y}),slice};
    }

    this.getLength = (p1,p2)=>{
      return Math.sqrt(Math.pow(p1.x - p2.x,2) + Math.pow(p1.y - p2.y,2))
    }

    this.getAngle = (a,b)=>{
      var deltaX = b.x - a.x,deltaY = b.y - a.y;
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
      if(dip === Infinity){return y === undefined?false:{x:a.x,y}}
      if(dip === 0){return x === undefined?false:{x,y:a.y}}
      if(x !== undefined){return {x,y:dip * (x - a.x) + a.y}}
      if(y !== undefined){return {x:(y - a.y) / dip + a.x,y}}
      return false;
    }

    this.getMeet = (a1,a2,b1,b2)=>{ 
      if(typeof a1 !== 'object' || typeof b1 !== 'object'){return false}
      var dip1 = typeof a2 === 'object'?this.getDip(a1,a2):a2;
      var dip2 = typeof b2 === 'object'?this.getDip(b1,b2):b2; 
      if(dip1 === dip2){return false}
      if(dip1 === Infinity){return this.getPointOfLine(b1,dip2,{x:a1.x})}
      if(dip2 === Infinity){return this.getPointOfLine(a1,dip1,{x:b1.x})}
      var x = ((dip1 * a1.x) - (dip2 * b1.x) + b1.y - a1.y) / (dip1 - dip2);
      var y = dip1 * (x - a1.x) + a1.y;
      return {x,y}
    }

    this.divide = (p1,p2, count)=>{ 
      var deltaX = p2.x - p1.x,deltaY = p2.y - p1.y;
      var dX = deltaX / count,dY = deltaY / count;
      var points = [];
      for (var i = 1; i < count; i++) {
          points.push({x:i * dX + p1.x,y:i * dY + p1.y});
      }
      return points;    
    }

    this.getPrependicularPointToLine = (p1,p2, p)=>{
      var dip = this.getDip(p1,p2);
      var x,y;
      if (dip === 0) {y = p1.y; x = p.x;} 
      else if (dip === Infinity) {y = p.y,x = p1.x;} 
      else {
        x = ((p.x / dip) + (dip * p1.x) + p.y - p1.y) / (dip + (1 / dip));
        y = (dip * x) - (dip * p1.x) + p1.y;
      }
      return {x,y};
    }

    this.getPrependicularPointFromLine = (p1,p2,p,offset)=>{
      if(p === 'center'){p = this.getAvg(p1,p2)}
      else if(p === 'start'){p = p1;}
      else if(p === 'end'){p = p2;}
      if(!offset){return p;}
      var angle = this.getAngle(p1,p2);
      var deltaX = offset * Math.cos((angle - 90) * Math.PI / 180);
      var deltaY = offset * Math.sin((angle - 90) * Math.PI / 180);
      return {x:p.x + deltaX,y:p.y + deltaY,deltaX,deltaY}
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
            {x:beforePoint.x + deltaX,y:beforePoint.y + deltaY,r:beforePoint.r?(beforePoint.r + offset < 0?0:beforePoint.r + offset):undefined},  
            {x:point.x + deltaX,y:point.y + deltaY,r:point.r?(point.r + offset < 0?0:point.r + offset):undefined},
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
          line[0].x = beforeMeet?beforeMeet.x:line[0].x;
          line[0].y = beforeMeet?beforeMeet.y:line[0].y;
          points.push(line[0]);
          if(i === length - 1 && !close){points.push(line[1]);}
      } 
      return points;
    }

    this.getLineBySLA = (p1,length,angle)=>{
      return {p1,p2:{x:p1.x+(Math.cos(angle * Math.PI / 180) * length),y:p1.y + (Math.sin(angle * Math.PI / 180) * length)}};
    }

    this.shiftLine = (p1,p2,value)=>{
      if(value === 0){return {p1,p2}}
      var angle,line,deltaX,deltaY;
      var length = this.getLength(p1,p2);
      if(value > 0){
        angle = this.getAngle(p1,p2);
        line = this.getLineBySLA(p1,length + value,angle);  
        deltaX = line.p2.x - p2.x;
        deltaY = line.p2.y - p2.y;
      }
      else{
        angle = this.getAngle(p2,p1);
        line = this.getLineBySLA(p2,length + Math.abs(value),angle);  
        deltaX = line.p2.x - p1.x;
        deltaY = line.p2.y - p1.y;
      }
      return {p1:{x:p1.x + deltaX,y:p1.y + deltaY},p2:{x:p2.x + deltaX,y:p2.y + deltaY}}
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
    this.help = ()=>{
      return `
        ---------------------------------------
        getAvg(arr) 
        parameters:
          1- arr (array of points) Example: [{x:number,y:number},...]
        return: object Example: {x:number,y:number}
        Description: get array of points and return average point
        ---------------------------------------
        getDip(p1,p2,prep)
        parameters:
          1- p1 (first point of line) Example: {x:number,y:number}
          2- p2 (second point of line) Example: {x:number,y:number}
        return: number
        Description:
    } 

    this.getArcBy3Points = (p1,p2,p3)=>{  
      var meet = this.getMeet(this.getAvg([p1,p2]),this.getDip(p1,p2,true),this.getAvg([p2,p3]),this.getDip(p2,p3,true));  
      if(!meet){return false};
      var {x,y} = meet;
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
      return {x,y,r:this.getLength(p1,{x,y}),slice};
    }

    this.getLength = (p1,p2)=>{
      return Math.sqrt(Math.pow(p1.x - p2.x,2) + Math.pow(p1.y - p2.y,2))
    }

    this.getAngle = (a,b)=>{
      var deltaX = b.x - a.x,deltaY = b.y - a.y;
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
      if(dip === Infinity){return y === undefined?false:{x:a.x,y}}
      if(dip === 0){return x === undefined?false:{x,y:a.y}}
      if(x !== undefined){return {x,y:dip * (x - a.x) + a.y}}
      if(y !== undefined){return {x:(y - a.y) / dip + a.x,y}}
      return false;
    }

    this.getMeet = (a1,a2,b1,b2)=>{ 
      if(typeof a1 !== 'object' || typeof b1 !== 'object'){return false}
      var dip1 = typeof a2 === 'object'?this.getDip(a1,a2):a2;
      var dip2 = typeof b2 === 'object'?this.getDip(b1,b2):b2; 
      if(dip1 === dip2){return false}
      if(dip1 === Infinity){return this.getPointOfLine(b1,dip2,{x:a1.x})}
      if(dip2 === Infinity){return this.getPointOfLine(a1,dip1,{x:b1.x})}
      var x = ((dip1 * a1.x) - (dip2 * b1.x) + b1.y - a1.y) / (dip1 - dip2);
      var y = dip1 * (x - a1.x) + a1.y;
      return {x,y}
    }

    this.divide = (p1,p2, count)=>{ 
      var deltaX = p2.x - p1.x,deltaY = p2.y - p1.y;
      var dX = deltaX / count,dY = deltaY / count;
      var points = [];
      for (var i = 1; i < count; i++) {
          points.push({x:i * dX + p1.x,y:i * dY + p1.y});
      }
      return points;    
    }

    this.getPrependicularPointToLine = (p1,p2, p)=>{
      var dip = this.getDip(p1,p2);
      var x,y;
      if (dip === 0) {y = p1.y; x = p.x;} 
      else if (dip === Infinity) {y = p.y,x = p1.x;} 
      else {
        x = ((p.x / dip) + (dip * p1.x) + p.y - p1.y) / (dip + (1 / dip));
        y = (dip * x) - (dip * p1.x) + p1.y;
      }
      return {x,y};
    }

    this.getPrependicularPointFromLine = (p1,p2,p,offset)=>{
      if(p === 'center'){p = this.getAvg(p1,p2)}
      else if(p === 'start'){p = p1;}
      else if(p === 'end'){p = p2;}
      if(!offset){return p;}
      var angle = this.getAngle(p1,p2);
      var deltaX = offset * Math.cos((angle - 90) * Math.PI / 180);
      var deltaY = offset * Math.sin((angle - 90) * Math.PI / 180);
      return {x:p.x + deltaX,y:p.y + deltaY,deltaX,deltaY}
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
            {x:beforePoint.x + deltaX,y:beforePoint.y + deltaY,r:beforePoint.r?(beforePoint.r + offset < 0?0:beforePoint.r + offset):undefined},  
            {x:point.x + deltaX,y:point.y + deltaY,r:point.r?(point.r + offset < 0?0:point.r + offset):undefined},
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
          line[0].x = beforeMeet?beforeMeet.x:line[0].x;
          line[0].y = beforeMeet?beforeMeet.y:line[0].y;
          points.push(line[0]);
          if(i === length - 1 && !close){points.push(line[1]);}
      } 
      return points;
    }

    this.getLineBySLA = (p1,length,angle)=>{
      return {p1,p2:{x:p1.x+(Math.cos(angle * Math.PI / 180) * length),y:p1.y + (Math.sin(angle * Math.PI / 180) * length)}};
    }

    this.shiftLine = (p1,p2,value)=>{
      if(value === 0){return {p1,p2}}
      var angle,line,deltaX,deltaY;
      var length = this.getLength(p1,p2);
      if(value > 0){
        angle = this.getAngle(p1,p2);
        line = this.getLineBySLA(p1,length + value,angle);  
        deltaX = line.p2.x - p2.x;
        deltaY = line.p2.y - p2.y;
      }
      else{
        angle = this.getAngle(p2,p1);
        line = this.getLineBySLA(p2,length + Math.abs(value),angle);  
        deltaX = line.p2.x - p1.x;
        deltaY = line.p2.y - p1.y;
      }
      return {p1:{x:p1.x + deltaX,y:p1.y + deltaY},p2:{x:p2.x + deltaX,y:p2.y + deltaY}}
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
      `
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
