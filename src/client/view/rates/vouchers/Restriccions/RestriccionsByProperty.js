import React, { Component } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {CleverRequest,CleverAccordion,GridView,CleverInputCheckbox,GridViewLigth,CleverLoading,MComponentes} from "clever-component-library";

export default class RestriccionsByProperty extends Component {
    constructor(props) {
        super(props);
        this.setDataGrids = this.setDataGrids.bind(this);
        this.ChangeDataRoom = this.ChangeDataRoom.bind(this);
        this.createBodyAcordion = this.createBodyAcordion.bind(this);
        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            visibleAcordion:false,
            load: false,
            dataRestriccions:{},
            checkRooms:[],
        }
    }

    componentDidMount(){  
        let dataRates= this.props.dataRatePlans;
        this.setState({ratePlanIni:dataRates},()=>{            
            this.getPropeties(()=>{ 
                this.createHeadAcordion(()=>{
                    this.setInputCheckedRoom(()=>{                  
                        this.createBodyAcordion(()=>{
                            this.setDataGrids();
                        });
                    });
                });                       
            });
        })
        
    }

    getPropeties(functionProperties=()=>{}) {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property/get?all/", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }

            if(!error){
                if (!response.Error) {
                    let data = response.data;
                    let dataProperties = [];
                    data.map((dataProperty)=>{
                        if(dataProperty.estado ==1){
                            dataProperties.push(dataProperty);
                        }
                    });
                    this.setState({ dataResort: dataProperties,loader: false },functionProperties);
                }
                else {
                    MComponentes.toast("ERROR in propreties");
                    this.setState({ loader: false },functionProperties)
                }
            }else{
                this.setState({ loader: false },functionProperties)
            }
            
        });

    }

    createHeadAcordion(functionHeadAcordion=()=>{}){
        let {dataResort}= this.state;

        let headAcordion= [];
        dataResort.map((data,key) =>{
            let code = data.property_code;
            let nameResort = data.short_name;
            headAcordion.push({accordion: `resort${code}`,label:`${nameResort}`,controls:[]})
        })
       this.setState({headByProperty:headAcordion},functionHeadAcordion)
    }

    createBodyAcordion(functionBodyAcordion=()=>{}){
        let {dataResort,checkRooms}= this.state;
        let bodyAcordion = {};

        //Crea los combos por propiedad
        dataResort.map((dataHead,key)=>{
            let code = dataHead.property_code;
            let idProperty = dataHead.iddef_property;
            bodyAcordion[`resort${code}`]=(<div className='row' key={key}>
                    <GridView 
                        idTable={`tableRatePlans${idProperty}`}
                        onRef={ref => this[`tblRatePlan${idProperty}`] = ref}
                        serializeRows={true}
                        classTable={'clever-table responsive-table striped bordered'}
                        filter={false}
                        columns={[
                            { attribute : 'idop_rateplan', visible : false },
                            {
                                attribute: 'actions',
                                alias: 'Rooms All',
                                filter: false,
                                value: (dataRate, index) => {
                                    let dataRooms = dataRate.rate_plan_rooms;
                                    let idRate = dataRate.idop_rateplan;
                                    return (
                                        <label>
                                            <input type='checkbox' 
                                            id={`checkALLRoom|${idProperty}|${idRate}`} 
                                            name={`checkALLRoom|${idProperty}|${idRate}`} 
                                            className={'filled-in'} 
                                            onChange={e=>this.ChangeDataRoom(e,'ALL',idProperty,idRate,dataRooms)} 
                                            /> 
                                            <span></span>   
                                        </label>                     
                                    )
                                }
                            },
                            { attribute : 'code', alias : 'Code'},
                            { attribute : 'rate_code_base', alias : 'Code Base'},
                            { attribute : 'rate_code_clever', alias : 'Code Clever' },
                            { attribute : 'currency_code', alias : 'Currency' },
                            {
                                alias: 'Rooms',
                                expandCall: (dataRate, index) => {
                                    let idRate = dataRate.idop_rateplan;
                                    let dataRooms = dataRate.rate_plan_rooms;    
                                    return (
                                        <GridViewLigth
                                            serializeRows={false}
                                            key={idRate}
                                            classTable={'clever-table responsive-table striped bordered'}
                                            columns = {[
                                                        {attribute : 'id_room', visible : false },
                                                        {attribute: 'actions',
                                                            alias: 'Select Rooms',
                                                            filter: false,
                                                            value: (dataRoom) => {
                                                                let code = dataRoom.room_code;                                            
                                                                return(
                                                                    <div className='col s12 m9 l9'>
                                                                        <CleverInputCheckbox
                                                                            id={`checkRoom${idProperty}|${idRate}|${code}`}
                                                                            size={'col s12 m3 l3'}
                                                                            name={`checkRoom${idProperty}|${idRate}|${code}`}
                                                                            checkboxs={[
                                                                                    {value:String(`checkRoom${idProperty}|${idRate}|${code}`),label:''},
                                                                                ]}
                                                                            onChange={e=>this.ChangeDataRoom(e,'',idProperty,idRate,dataRooms)}
                                                                            defaultValues={checkRooms}    
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                                        },
                                                        { attribute : 'room_code', alias : 'Code'},
                                                        { attribute : 'room_description', alias : 'Code Base'},
                                            ]}
                                            data ={dataRooms}
                                        />  
                                    );
                                }
                            }
                        ]}  
                    />                

            </div>);        
        });
        this.setState({bodyByProperty:bodyAcordion},functionBodyAcordion);
    }

    setInputCheckedRoom(functionCheckIni=()=>{}){
        let {ratePlanIni} = this.state;
        let dataChecksIni = [];
        
        ratePlanIni.map((ratesByProp)=>{
            
            let idProperty= ratesByProp.iddef_property;
            let dataRates = ratesByProp.promo_code_rateplans.filter(dataRate => dataRate.estado == 1);  

            dataRates.map((rates)=>{
                let idRate = rates.idop_rateplan;
                let roomsByRate = rates.rooms_rateplan;

                roomsByRate.map((codeRoom)=>{
                    dataChecksIni.push(`checkRoom${idProperty}|${idRate}|${codeRoom}`)
                });
            });
        });

        this.setState({checkRooms:dataChecksIni},functionCheckIni);

    }

    setDataGrids(){
        let {dataResort}= this.state;
        for (let index = 0; index < dataResort.length; index++) {
            let idProperty = dataResort[index].iddef_property;  
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/property-plans/get?property=${idProperty}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if(!error){
                    if (!response.Error) {
                        let dataTable = response.data;                                  
                        // let filterRateCurrent = dataTable.filter(data => data.estado ==1);                        
                        this[`tblRatePlan${idProperty}`].setDataProvider(dataTable); 
                        this.validateChecksIniALL(idProperty,dataTable);  
                    }else{
                        this.setState({load: false},functionSetData);
                    }
    
                }else{
                    this.setState({load: false},functionSetData);
                }
            });
        }
    }

    validateChecksIniALL(idProperty,dataCurrentRate){
        /** dataCurrentRate son los rates que se encuentran configurados por propiedad */
        let {ratePlanIni} = this.state;
        /** ratePlanIni son los rates que tiene asignado inicialmente el voucher, 
         * se filtran para solo procesar aquellos que traen datos marcados y asi agilizar el proceso*/        
        let ratePlansData = ratePlanIni.filter(data => data.promo_code_rateplans.length > 0);
        /** Se valida que dataCurrentRate tenga datos sino no tiene caso meterlos al ciclo */
        if(dataCurrentRate.length > 0){
            /** Se extrae los rates marcados del voucher de acuerdo a la propiedad que se esta creando */
            let ratesConfByVoucher= ratePlansData.filter(data => data.iddef_property == idProperty);
            /** Si existen datos registrados en el voucher por la propiedad en cuestion, 
             * entonces se reliaza la validacion de los marcados contra los rates configurados en la propiedad*/
            if(ratesConfByVoucher.length > 0 ){
                /** Se recorre el  ratesConfByVoucher para poder comparar los id's de rates y la cantidad de rooms*/
                ratesConfByVoucher.map((rateVoucher) => {
                    /** Se recorre cada Rate plan */
                    let promoCodeRate = rateVoucher.promo_code_rateplans !== undefined ? rateVoucher.promo_code_rateplans : [];
                    promoCodeRate.map((codeRatesVoucher)=>{
                        let idRatePlanVoucher = codeRatesVoucher.idop_rateplan;
                        let roomsRateVoucher = codeRatesVoucher.rooms_rateplan;
                        /** Ordena el array de los rooms vouchers */
                        roomsRateVoucher = roomsRateVoucher.sort();
                        let countRoomsRateVoucher = roomsRateVoucher.length;                        
                        /** Se aplica un filter a los datos de rates configurados para la propiedad 
                         *  para extraer los rooms del mismo*/
                        let ratesByProperty = dataCurrentRate.find(ratesProperty => ratesProperty.idop_rateplan == idRatePlanVoucher);
                        /** Valida si se encontro coincidencia en los rates configurados 
                         * para la propiedad contra los marcados actualemente por el voucher */
                        if(ratesByProperty !== undefined){
                            let roomsRateProperty = ratesByProperty.rate_plan_rooms !== undefined ? ratesByProperty.rate_plan_rooms : [];
                            /** Se arma un array con solo los codigos de rooms de roomsRateProperty*/
                            let codeRoomsProperty = [];
                            roomsRateProperty.map(rooms => codeRoomsProperty.push(rooms.room_code));
                            /** Ordena el array de los rooms de la propiedad */
                            codeRoomsProperty = codeRoomsProperty.sort();
                            let countRoomsRateProperty = codeRoomsProperty.length;
                            /** Se realiza una primera validacion para saber si la cantidad de 
                             * rooms configurados en el voucher coincide con los configurados para la propiedad */
                            if(countRoomsRateVoucher >= countRoomsRateProperty){
                                let nameCheck = `checkALLRoom|${idProperty}|${idRatePlanVoucher}`; 
                                /** Filtrado de los codigos de rooms de las propiedades que coinciden con los
                                 * codigos de rooms configurados en el voucher */ 
                                let compareRooms = codeRoomsProperty.filter(roomsProperty => roomsRateVoucher.includes(roomsProperty));
                                let countCompareRooms = compareRooms.length;
                                /** Se realiza una segunda validacion para verificar los codigos marcados en el voucher 
                                 * son los mismos que los que se encuentran configurados en la propiedad
                                */
                                if(countCompareRooms == countRoomsRateProperty){
                                    /** Si se pasan todas las validaciones se marca el input del rate correspondiente a la propiedad */
                                    document.getElementById(`${nameCheck}`).checked = true;
                                }
                            }
                        }
                    });                    
                });
            }
        }
        
    }

    ChangeDataRoom(e,type,idResort,idRate,dataRooms){
        let {checkRooms} = this.state;
        let valueChecked = document.getElementById(`checkALLRoom|${idResort}|${idRate}`)!== null 
                         ? document.getElementById(`checkALLRoom|${idResort}|${idRate}`).checked :false;
        let nameChecked = '';
        let codeRoom = '';
        let idChecked = '';

        if(type == 'ALL'){
            if(valueChecked == true){                
                dataRooms.map((rooms)=>{
                    codeRoom = rooms.room_code;
                    nameChecked = `checkRoom${idResort}|${idRate}|${codeRoom}`;
                    idChecked = document.getElementById(`${nameChecked}-0`);                    
                    let existChecked = checkRooms.find(dataInput => dataInput == nameChecked);
                    //Se agrega el valor al state siempre que este no exista con anterioridad
                    !existChecked ? checkRooms.push(nameChecked) :null;
                    /** Si el grid secundario se encuentra abierto adicionalmente se aplica el checked sobre
                     * el id el objeto para que no sea necesario cerra y volver a abrir para ver los marcados
                     */
                    idChecked !== null ? idChecked.checked = true : null;
                });
            }else{
                dataRooms.map((rooms)=>{
                    codeRoom = rooms.room_code;
                    nameChecked = `checkRoom${idResort}|${idRate}|${codeRoom}`;
                    idChecked = document.getElementById(`${nameChecked}-0`);
                    //Se obtiene el index del objeto a elimar y con el splice se saca del array principal
                    let valueIndex = checkRooms.indexOf(nameChecked);
                    checkRooms.splice(valueIndex, 1); 
                    /** Si el grid secundario se encuentra abierto adicionalmente se aplica el checked=false sobre
                     * el id el objeto para que no sea necesario cerra y volver a abrir para ver los desmarcados
                     */
                    idChecked !== null ? idChecked.checked = false : null;
                });
            }
        }else if(type == ''){
            let arrayInputsChecked = []; // Data actual de inputs marcados
            let sizeRoomsByRate = dataRooms.length; // Total de rooms por id de rate
            /** Cuando se da check sobre cualquier input secundario se procede a contar los que se encuentran
             * marcados actualmente para de esta forma determinar si el input de all de dicho rate se marcara o
             * desmarcara
            */
            dataRooms.map((roomsByRate)=>{
                codeRoom = roomsByRate.room_code;
                nameChecked = `checkRoom${idResort}|${idRate}|${codeRoom}`;
                let existInput = checkRooms.find(dataInput => dataInput == nameChecked);
                existInput ? arrayInputsChecked.push(nameChecked) :null;
            });
            /**Si la cantidad de inputs marcados actualmente es igual a la cantidad total de rooms quiere decir que
             * todos se encuentran checked por tanto el ALL de dicho rate debera marcarse, en caso contrario debera desmarcarse
             */
            arrayInputsChecked.length == sizeRoomsByRate 
            ? document.getElementById(`checkALLRoom|${idResort}|${idRate}`).checked = true
            : document.getElementById(`checkALLRoom|${idResort}|${idRate}`).checked = false
        }

    }

    getValuesFrm(){
        let {checkRooms} = this.state;
        let requestRatesPlans = [];
        let dataInputsCheked = [];

        //Extraccion de los datos de los inputs marcados
        checkRooms.map((dataCheckRoom)=>{
            // Elimina la palabra checkRooms
            let splitNameRoom = dataCheckRoom.split(`checkRoom`);
            let splitDataRate =  splitNameRoom[1].split('|');

            dataInputsCheked.push({idResort:splitDataRate[0],idRate:splitDataRate[1],codeRoom:splitDataRate[2]})      
        });

        /** Se realiza el agrupamiento de los inputs por hoteles 
         * dataRateResort es el array que se formara agrupado por hotel
         * current es el elemento actual del array dataInputsCheked
        */
        let dataRatesByResort = dataInputsCheked.reduce((dataRateResort, current) => {
            // Compruebo si ya existe el elemento
            let existResort = dataRateResort.find(valuePrev => valuePrev.iddef_property == current.idResort);
            // Si no existe lo creo con un array vacío en ratePlan
            if (!existResort) {
                existResort = {iddef_property: current.idResort, ratePlan: []};
                dataRateResort.push(existResort);
            }
            // Si el elemento actual tiene ratePlan lo añado al array del
            // elemento existente
            if (current.idRate != null){
                existResort.ratePlan.push({idop_rateplan:current.idRate,codeRoom:current.codeRoom});
            }            
            // Devuelvo el array resultado para la nueva iteración
            return dataRateResort;
        }, []);

        // Se recorre el resultado obtenido del agrupamiento de informacion por hotel
        dataRatesByResort.map((dataRates)=>{
            // Lo que realmente importa es obtener la informacion de los rates
            let valueRooms = dataRates.ratePlan;
            let idResort = {};
            //Se procede a agrupar los rates plan
            let requestRooms= valueRooms.reduce((dataRoom, current) => {
                // Se llena el valor de resort por cada proceso de agrupamiento
                idResort = dataRates.iddef_property;
                // Compruebo si ya existe el elemento del id de rate plan
                let existRoom = dataRoom.find(valuePrev => valuePrev.idop_rateplan == current.idop_rateplan);
                // Si no existe lo creo con un array vacío en rooms_rateplan
                if (!existRoom) {
                    existRoom = {idop_rateplan: current.idop_rateplan, rooms_rateplan: []};
                    dataRoom.push(existRoom);
                }
                // Si el elemento actual tiene rooms_rateplan lo añado al array del elemento existente
                if (current.codeRoom != null){
                    existRoom.rooms_rateplan.push(current.codeRoom);
                }            
                // Devuelvo el array resultado para la nueva iteración de la seccion de rate plans
                return dataRoom;
            }, []);
            // Se agregan los resultados al array de salida.
            requestRatesPlans.push({iddef_property:idResort,promo_code_rateplans:requestRooms});
        });
        return requestRatesPlans;
    }

    render(){ 
        let {load,headByProperty,bodyByProperty,visibleAcordion} = this.state;
        return(
            <div>               
                <CleverLoading show={load}/>              
                {bodyByProperty?
                <CleverAccordion
                    id={'collapsibleRateByProperty'}
                    accordion={{
                                head: headByProperty,
                                body: [bodyByProperty]
                            }
                    }

                />
                :null}
            </div>
            
        );
    }

}

RestriccionsByProperty.defaultProps = {
    dataRatePlans: []
}