export default function RGeometric(){
  var a = {
    fix(value){return parseFloat(value.toFixed(6))},
    getNumberByStep(number,step){return Math.round(number / step) * step;},
    getLength(line){
      var {x1,y1,x2,y2} = line;
      return Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2))
    },
    getAvg(points){
      let totalX = 0,totalY = 0;
      for(let i = 0; i < points.length; i++){
        let [x,y] = points[i];
        totalX += x; totalY += y;
      }
      return [totalX / points.length,totalY / points.length]
    },
    getDip(line){
      var {x1,y1,x2,y2} = line;
      var deltaY = this.fix(y1 - y2),deltaX = this.fix(x1 - x2); 
      var dip = deltaY / deltaX;
      dip = parseFloat(dip.toFixed(6)); 
      dip = isNaN(dip)?0:dip;
      return dip;
    },
    getPrepDip(line){var dip = this.getDip(line); dip = -1 / dip; return dip;},
    getYOnLineByX(line,x){
      var {dip = this.getDip(line),x1,y1} = line;
      if(dip === Infinity){return false}
      return dip * (x - x1) + y1;
    },
    getXOnLineByY(line,y){ // get {y,line} or {y,point,dip}
      var {dip = this.getDip(line),x1,y1} = line;
      if(dip === 0){return false}
      if(dip === Infinity){return x1}
      return (y - y1) / dip + x1;
    },
    getMeet(line1,line2){ //get {line1,line2} or {point1,point2,dip1,dip2}
      var {dip:dip1=this.getDip(line1)} = line1,{dip:dip2=this.getDip(line2)} = line2; 
      if(dip1 === dip2){return false}
      if(Math.abs(dip1) === Infinity){return [line1.x1,this.getYOnLineByX(line2,line1.x1)]}
      if(Math.abs(dip2) === Infinity){return [line2.x1,this.getYOnLineByX(line1,line2.x1)]}
      var x = ((dip1 * line1.x1) - (dip2 * line2.x1) + line2.y1 - line1.y1) / (dip1 - dip2);
      var y = dip1 * (x - line1.x1) + line1.y1;
      return [x,y]
    },
    getPrepToLine(line,point){
      var {dip = this.getDip(line),x1,y1} = line;
      var prepDip = this.getPrepDip(line);
      var prep = this.getMeet({x1,y1,dip},{x1:point[0],y1:point[1],dip:prepDip});
      return prep
    },
    getPrepFromLine(line,point,offset){
      if(!offset){return point;}
      var angle = this.getAngle(line);
      var {x2,y2} = this.getLineBySLA(point,offset,angle - 90)
      return [x2,y2];
    },
    getAngle(line){
      var deltaX = line.x2 - line.x1,deltaY = line.y2 - line.y1;
      var length = this.getLength({x1:0,y1:0,x2:deltaX,y2:deltaY});
      var angle = Math.acos(deltaX / length) / Math.PI * 180;
      return this.fix(Math.sign(deltaY) < 0?360 - angle:angle);
    },
    getCos(angle){
      if(angle === 90 || angle === 270){return 0}
      return Math.cos(angle * Math.PI / 180);
    },
    getSin(angle){
      if(angle === 180 || angle === 360){return 0}
      return Math.sin(angle * Math.PI / 180);
    },
    getLineBySLA(point,length,angle){  
      if(!length){return {x1:point[0],y1:point[1],x2:point[0],y2:point[1]}}
      return {x1:point[0],y1:point[1],x2:point[0]+(this.getCos(angle) * length),y2:point[1] + (this.getSin(angle) * length)}
    },
    setLineByLength(line,length,side = 'end'){
      var p1,p2,start,angle = this.getAngle(line);
      if(side === 'center'){
        start = this.getAvg([[line.x1,line.y1],[line.x2,line.y2]]);
        let l1 = this.getLineBySLA(start,length / 2,angle + 180);
        let l2 = this.getLineBySLA(start,length / 2,angle);
        p1 = [l1.x2,l1.y2];
        p2 = [l2.x2,l2.y2];
      }
      else if(side === 'end'){
        p1 = [line.x1,line.y1];
        let l = this.getLineBySLA(p1,length,angle);
        p2 = [l.x2,l.y2];
      }
      else if(side === 'start'){
        p2 = [line.x2,line.y2];
        let l = this.getLineBySLA(p2,length,angle + 180);
        p1 = [l.x2,l.y2]
      }
      return {x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1]};
    },
    getParallelLine(points,offset,close){
      var lines = [];
      var length = points.length;
      if(length === 2){
        let p1 = this.getPrepFromLine({x1:points[0][0],y1:points[0][1],x2:points[1][0],y2:points[1][1]},points[0],offset);
        let p2 = this.getPrepFromLine({x1:points[0][0],y1:points[0][1],x2:points[1][0],y2:points[1][1]},points[1],offset);
        return [p1,p2];
      }
      for(var i = 1; i <= length; i++){
          var point = points[i];
          var beforePoint = points[i - 1];
          if(i === length){
            if(close){point = points[0]}
            else{break;}
          }
          var p1 = this.getPrepFromLine({x1:beforePoint[0],y1:beforePoint[1],x2:point[0],y2:point[1]},beforePoint,offset);
          var p2 = this.getPrepFromLine({x1:beforePoint[0],y1:beforePoint[1],x2:point[0],y2:point[1]},point,offset);
          lines.push({x1:p1[0],y1:p1[1],x2:p2[0],y2:p2[1]});
      }
      var points = [];
      length = lines.length;
      for(var i = 0; i < length; i++){
          var line = lines[i];
          var beforeLine = lines[i - 1];
          if(i === 0){
            if(!close){points.push([line.x1,line.y1]); continue}
            beforeLine = lines[lines.length - 1];
          }
          var meet = this.getMeet(beforeLine,line);
          points.push(meet);
          if(i === length - 1 && !close){points.push([line.x2,line.y2]);}
      } 
      return points;
    },
    getPointsByDivide(line,divide){
      var {x1,y1,x2,y2} = line;
      var deltaX = this.fix(x2 - x1),deltaY = this.fix(y2 - y1);
      var uX = deltaX / divide,uY = deltaY / divide;
      var startPoint = [x1,y1];
      var points = [];
      for(var i = 1; i < divide; i++){
        points.push([startPoint[0] + i * uX,startPoint[1] + i * uY])
      }
      return points;
    },
    setLineByAngle(line,angle){
      var length = this.getLength(line);
      if(!length){return line}
      angle = angle % 360;
      return this.getLineBySLA([line.x1,line.y1],length,angle); 
    },
    setLineByOrtho(line,ortho){
      var angle = this.getAngle(line);
      angle = this.getNumberByStep(angle,ortho);
      return this.setLineByAngle(line,angle)
    },
    rotateSpline(points,angle,center){
      var Points = JSON.parse(JSON.stringify(points));
      for(var i = 0; i < Points.length; i++){
        let p = Points[i];
        let line = {x1:center[0],y1:center[1],x2:p[0],y2:p[1]};
        let lineAngle = this.getAngle(line);
        line = this.setLineByAngle(line,angle + lineAngle);
        p[0] = line.x2;
        p[1] = line.y2;
      }
      return Points;
    },
    getInnerMeet(line1,line2){
      var meet = this.getMeet(line1,line2);
      if(meet === false){return false}
      if(line2.x1 < line2.x2){
        if(meet[0] < line2.x1 || meet[0] > line2.x2){return false} 
      }
      else {
        if(meet[0] < line2.x2 || meet[0] > line2.x1){return false} 
      }
      if(line2.y1 < line2.y2){
        if(meet[1] < line2.y1 || meet[1] > line2.y2){return false} 
      }
      else {
        if(meet[1] < line2.y2 || meet[1] > line2.y1){return false} 
      }
      if(line1.x1 < line1.x2){
        if(meet[0] < line1.x1 || meet[0] > line1.x2){return false} 
      }
      else {
        if(meet[0] < line1.x2 || meet[0] > line1.x1){return false} 
      }
      if(line1.y1 < line1.y2){
        if(meet[1] < line1.y1 || meet[1] > line1.y2){return false} 
      }
      else {
        if(meet[1] < line1.y2 || meet[1] > line1.y1){return false} 
      }
      return meet;
    },
    isPointInPath(points,point){
      let meets = 0;
      for(let i = 0; i < points.length; i++){
        let curentPoint = points[i],nextPoint;
        if(i === points.length - 1){nextPoint = points[0]}
        else{nextPoint = points[i + 1]}
        let meet = this.getInnerMeet({x1:point[0],y1:point[1],x2:9999999999,y2:point[1]},{x1:curentPoint[0],y1:curentPoint[1],x2:nextPoint[0],y2:nextPoint[1]});
        if(meet !== false){meets++}
      }
      return meets % 2 !== 0;
    },
    getDXFText(list){
      var get = {
        line:function({x1,y1,x2,y2}){
          var line = '';
          line +=
            "LINE" + "\r\n" +
            "8" + "\r\n" +
            "1" + "\r\n" +
            "62" + "\r\n" +
            "0" + "\r\n" +
            "10" + "\r\n" +
            (x1) + "\r\n" +
            "20" + "\r\n" +
            (y1) * -1 + "\r\n" +
            "30" + "\r\n" +
            "0.0" + "\r\n" +
            "11" + "\r\n" +
            (x2) + "\r\n" +
            "21" + "\r\n" +
            (y2) * -1 + "\r\n" +
            "31" + "\r\n" +
            "0.0" + "\r\n" +
            "0" + "\r\n";
          return line;
        },
        circle:function({x,y,radius}){
          var circle = '';
          circle +=
            "CIRCLE" + "\r\n" +
            "8" + "\r\n" +
            "1" + "\r\n" +
            "62" + "\r\n" +
            "0" + "\r\n" +
            "10" + "\r\n" +
            (x) + "\r\n" +
            "20" + "\r\n" +
            (y) * -1 + "\r\n" +
            "30" + "\r\n" +
            "0.0" + "\r\n" +
            "40" + "\r\n" +
            (radius) + "\r\n" +
            "0" + "\r\n";
          return circle;
        },
        rectangle:function({start,end}){
          var [x1,y1] = start,[x2,y2] = end;
          var rectangle = '';
          rectangle += this.line({x1:x1,y1:y1,x2:x2,y2:y1});
          rectangle += this.line({x1:x2,y1:y1,x2:x2,y2:y2});
          rectangle += this.line({x1:x2,y1:y2,x2:x1,y2:y2});
          rectangle += this.line({x1:x1,y1:y2,x2:x1,y2:y1});
          return rectangle;
        },
        arc:function({x,y,radius,startAngle,endAngle}){
          var arc = '';
          arc +=
            "ARC" + "\r\n" +
            "8" + "\r\n" +
            "1" + "\r\n" +
            "62" + "\r\n" +
            "0" + "\r\n" +
            "10" + "\r\n" +
            (x) + "\r\n" +
            "20" + "\r\n" +
            (y) * -1 + "\r\n" +
            "30" + "\r\n" +
            "0.0" + "\r\n" +
            "40" + "\r\n" +
            (radius) + "\r\n" +
            "50" + "\r\n" +
            (startAngle) + "\r\n" +
            "51" + "\r\n" +
            (endAngle) + "\r\n" +
            "0" + "\r\n";
          return arc;
        }

      }
      var entities = '';
      for(var i = 0; i < list.length; i++){
        var {type} = list[i];
        entities += get[type](list[i])
      }
      var dxfText =
      "0" + "\r\n" +
      "SECTION" + "\r\n" +
      "2" + "\r\n" +
      "ENTITIES" + "\r\n" +
      "0" + "\r\n";
      dxfText+= entities;      
      dxfText +=
      "ENDSEC" + "\r\n" +
      "0" + "\r\n" +
      "EOF";
      return dxfText;
    }
  };
  return {
    fix:a.fix,
    getNumberByStep:a.getNumberByStep,
    getLength:a.getLength,
    getAvg:a.getAvg,
    getDip:a.getDip,
    getPrepDip:a.getPrepDip,
    getYOnLineByX:a.getYOnLineByX,
    getXOnLineByY:a.getXOnLineByY,
    getMeet:a.getMeet,
    getPrepToLine:a.getPrepToLine,
    getPrepFromLine:a.getPrepFromLine,
    getAngle:a.getAngle,
    getCos:a.getCos,
    getSin:a.getSin,
    getLineBySLA:a.getLineBySLA,
    setLineByLength:a.setLineByLength,
    getParallelLine:a.getParallelLine,
    getPointsByDivide:a.getPointsByDivide,
    setLineByAngle:a.setLineByAngle,
    setLineByOrtho:a.setLineByOrtho,
    rotateSpline:a.rotateSpline,
    getInnerMeet:a.getInnerMeet,
    isPointInPath:a.isPointInPath,
    getDXFText:a.getDXFText
  }
}