export class CssService{
    convertCssToJson(css:string){
        const res:any = [];
        const selectBody = /[{.a-z: \n;\d\\\\*\/#-]+}/gi;
        const cssBody = /{[a-z: \n;\d\\\\*\/#-]+}/gi;
        const selectName = /.+{/gi;

        const selectArray = css.match(selectBody);
        if (selectArray.length) {
            selectArray.map((s)=>{
                const body = s.match(cssBody)[0].slice(1,-1).split(";");
                const bodyRes:any = {};
                for (const elem of body) {
                    const style = elem.split(":");
                    bodyRes[style[0]] = style[1];                  
                }
                const name = s.match(selectName)[0].slice(0, -1);
                res.push({select: name, css: bodyRes});           
            })
        }
        return JSON.stringify(res);
    }
}