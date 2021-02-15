export async function downloadSVG(urlSGV){
    return fetch(urlSGV)
    .then(res => res.text())
    .then((fileSvg) => {
        // console.log('svg value ',svg);
        /** Elimina los estilos(fill) que tienen loa objetos en el archivo svg leido*/        
        let svgNOTfill = fileSvg.replace(/fill=".*?"/g, '');        
        /** Al objeto limpio de estilos se le aplica un formato 64 bits que se empleara
         * posteriormente para enviarlo en la creacion de los elementos svg de react
         */
         const svgString = window.btoa(svgNOTfill);
         const dataUri = `data:image/svg+xml;base64,${svgString}`;

        return {svg:fileSvg,svg64:dataUri,isError:''}
    }).catch(error => {
        {return {isError:error}}
    }); 
}

export function getIDsSVG(fileSVG){
    let data = [];
    let arrayIds = fileSVG.match(/<symbol(.*?)id="(.*?)\"/g);

    arrayIds.map((dataName)=>{
        let colorIcon = '';    
        let textIDIcon = dataName.replace(/<symbol(.*?)id=\/?"/g,'');
        textIDIcon = textIDIcon.replace(/"/g,'');    

        data.push({name:textIDIcon,color:colorIcon});
    });
    
    return data;
}