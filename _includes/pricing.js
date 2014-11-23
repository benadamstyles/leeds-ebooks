function init() {
  var f=document.getElementsByTagName("form")[0],
      log=function(m) {console.log(m);},
      roundToCashString=function roundToCashString(v) {
        var integer=Math.floor(v);
        return v-integer>0.004 ?
          v.toFixed(2) :
          integer;
      },
      model={
        result: function getResult() {
          var p=this.pages;
          var v=p*{
                    "prose": 0.6,
                    "poetry": 0.7,
                    "mixed": 0.7
                  }[this.format] +
            p * (this.images/50) +
            p * (this.footnotes ? 0.1 : 0);
          return (v?roundToCashString(Math.max(v,20)):0);
        },
        pages: 0,
        format: "",
        images: 0,
        footnotes: false
      };
  rivets.bind(f,model);
  document.removeEventListener("DOMContentLoaded", init, false);
}
document.addEventListener('DOMContentLoaded', init, false);
