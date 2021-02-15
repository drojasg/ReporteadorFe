import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import CleverConfig from "./../../../../../config/CleverConfig";
import { CleverButton, CleverForm, CleverRequest, CleverAccordion, MComponentes } from "clever-component-library";

export default class MainSeason extends Component {
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelSelected : hotelSelected ? true : false,
            seasonList: [],
            seasonListDescriptions: [],
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            data: [],
            data_send: {},
            temporadas: [],
            validations: false,
            periodos :[],
        };
        this.addSeason = this.addSeason.bind(this);
        this.addPeriod = this.addPeriod.bind(this);
        this.removeSeason = this.removeSeason.bind(this);
        this.removePeriod = this.removePeriod.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.validateStartDate = this.validateStartDate.bind(this);
        this.validateEndDate = this.validateEndDate.bind(this);
        this.getData = this.getData.bind(this);
        this.getDataApi = this.getDataApi.bind(this);

        this.arregloPeriodoSave = new Array();
        this.arregloPeriodoUpdate = new Array();
        
    }
     componentDidMount(){
         this.getDataApi();
     }
     
    getDataApi(){
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> } else {
            const idProperty = this.state.hotelData.iddef_property;
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/season/search/${idProperty}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) { this.setState({ seasonList:response.data, seasonListDescriptions: response.data }); }
            });       
        }
    }

    getSeasonTemplate() {
        return {
            "iddef_property": null,
            "description": "",
            "estado": 1,
            "periods": []
        };
    }

    getPeriodTemplate() {
        return {
            "iddef_period": null,
            "start_date": "",
            "end_date": "",
            "estado": 1
        };
    }

    addSeason() {
        let seasonList = this.state.seasonList;
        let newSeason = this.getSeasonTemplate();
        newSeason.description = "";
        //if (seasonList.length != 0 ){         
        seasonList.push(newSeason);
        this.setState({ seasonList: seasonList });
        //}
    }

    getData() {
        const seasonList = this.state.seasonList;

        seasonList.map((item, index) => {
            if (item.estado == 1) {
                const refSeason = this[`ref-season-${index}`]; 
                this.setState({
                    temporadas:refSeason
                })               
                
                item.periods.map((itemPeriod, indexPeriod) => {
                    if (itemPeriod.estado == 1) {
                        const refPeriod = this[`ref-season-${index}-period-${indexPeriod}`];
                    }
                });
            }
        });
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [year, month, day].join('-');
    }

    validateStartDate(fechaInicial){
        let today = new Date();
        today = this.formatDate(today);
        
        if (Date.parse(fechaInicial) < Date.parse(today)) {
            return true;
        }else{
            return false;
        }
        
    }

    validateEndDate(fechaInicial,fechaFinal){
        let today = new Date();
        today = this.formatDate(today);
        
        // let Startday = parseInt(fechaInicial);
        // today = parseInt(today);
        //console.warn(today);
        //console.warn(fechaInicial);

        
        if (Date.parse(fechaFinal) < Date.parse(today) || Date.parse(fechaInicial) > Date.parse(fechaFinal)) {
         
            return true;
        }else{
           
            return false;
        }
        
    }

    saveSeason(item, index) {
        let date = new Date();
        let seasonList = this.state.seasonList;
        const DescriptionFind = this.state.seasonListDescriptions;
        let notificationType="";
        let notificationMessage = "";
        let bandera = false;
        let banderaPeriod = false;
        const refSeason = this[`ref-season-${index}`];                
        const Seasons = refSeason.getData();
        let DescriptionExist =  DescriptionFind.find(tmp => tmp.description === item.description)

        item.periods.map((itemPeriods, indexPeriods) => {            

            if(itemPeriods.estado ==0){
                //let periodsU = periodsUpdate
                this.arregloPeriodoUpdate.push({
                    "estado": itemPeriods.estado,
                    "iddef_season": itemPeriods.iddef_season,
                    "end_date": itemPeriods.end_date,
                    "iddef_period_season": itemPeriods.iddef_period_season,
                    "start_date": itemPeriods.start_date
                });

            }else{
                if (itemPeriods.estado == 1) {
                    const refPeriods = this[`ref-season-${index}-period-${indexPeriods}`];
                   
                    let dataPeriod = refPeriods.getData()
                    
                    this.arregloPeriodoUpdate.push({
                        "estado": itemPeriods.estado,
                        "iddef_season": item.iddef_season,
                        "end_date": dataPeriod.values.end_date,
                        "iddef_period_season": itemPeriods.iddef_period_season == null ? null : itemPeriods.iddef_period_season,
                        "start_date": dataPeriod.values.start_date
                    });
                   
                    
                }
            }
        })
                
        if (item.estado == 1){
            if(item.description == ""  || item.description == null){
                MComponentes.toast("Please fill the Season Name");
            }else if(item.periods.length != 0){
                //console.log("periods", item.periods)
                item.periods.map((itemPeriod, indexPeriod) => {
                    
                    if (itemPeriod.estado == 1) {
                        //este esta bien 
                        const refPeriod = this[`ref-season-${index}-period-${indexPeriod}`];

                                                
                        let periods = refPeriod.getData()
                        console.log("ref",periods)
                        //periods los datos nuevos
                        //item period los datos de la base de datos
                       if(periods.start_date == itemPeriod.start_date){
                        MComponentes.toast("there is already a period that begins on the date indicated");
                       }else if(periods.end_date == itemPeriod.end_date){
                        MComponentes.toast("there is already a period ending on the indicated date");
                       }else if(periods.start_date == itemPeriod.end_date){
                        MComponentes.toast("the start date of the period cannot be the end date of an existing period");
                       }else if(periods.end_date == itemPeriod.start_date){
                        MComponentes.toast("la fecha de fin del periodo no puede ser la fecha de inicio de un periodo existente");
                       }else if (this.validateStartDate(periods.values.start_date)){ //(today > itemPeriod.values.start_date){
                            MComponentes.toast("the start date cannot be less than today");
                        }else if (this.validateEndDate(periods.values.start_date, periods.values.end_date )){
                            MComponentes.toast("The end date cannot be less than the start date");
                        }else{
                                                        
                            if(itemPeriod.iddef_period == null){
                                banderaPeriod = true
                            }else{
                                banderaPeriod = false
                            }
                           
                            bandera = true;

                            
                            this.arregloPeriodoSave.push({
                                "end_date": periods.values.end_date,
                                "start_date": periods.values.start_date,
                            });

                            
                        } 
 
                    }
                });

                this.SaveState(bandera,item,DescriptionExist);

            }else{
                notificationType = "error";
                notificationMessage = "Please, add a period";
                MComponentes.toast(notificationMessage);
            }
        }

    }

    SaveState(bandera,item,DescriptionExist){
        //console.log("bandera1", bandera)
        let arreglo = this.arregloPeriodoSave;
        console.log("arreglo fechas",arreglo)
        //return
        
        const idProperty = this.state.hotelData.iddef_property;
        if(item.periods.length == 0){
            MComponentes.toast("the season cannot be saved without periods");
        }
    if(bandera){
        if(item.iddef_property == null){
            //POST
            if(DescriptionExist.iddef_property !== null){
                MComponentes.toast("there is already a season with the same name");
             
             }else {
            let request = {}
            request["description"] = item.description
            request["iddef_property"] = idProperty
            request["periods"] = arreglo

            CleverRequest.post(CleverConfig.getApiUrl('bengine') + "/api/season/create", request, (data, error) => {
                if (data.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {

                    let notificationMessage = "";
                    let notificationType="";

                    if (!data.Error) {

                        notificationType = "success";
                        notificationMessage = "The data was saved";
                        this.arregloPeriodoSave = new Array();
                        this.getDataApi()
                    
                    } else {
                        console.log(data.Msg);
                        notificationType = "error";
                        notificationMessage = "The data was no saved";
                        this.arregloPeriodoSave = new Array();
                    }
                
                    MComponentes.toast(notificationMessage);
                }
            })
        }

        }else{
            //PUT
            const idSeason = item.iddef_season
            let arregloUpdate = this.arregloPeriodoUpdate;
            let dataSend = {
                 "description": item.description,
                 "iddef_property": idProperty,
                 "periods": arregloUpdate,
                 "estado": item.estado
             };
            CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/season/update/${idSeason}`, dataSend, (data, error) => {
                //console.warn("RESPONSE: ",data);
                if (data.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    let notificationType = "";
                    let notificationMessage = "";
                
                    if (!data.Error) {
                        notificationType = "success";
                        notificationMessage = "The data was updated";
                    
                    } else {
                        notificationType = "error";
                        notificationMessage = "The data was no updated";
                    }
                    MComponentes.toast(notificationMessage);
                }
            })   

        }

    }else{
        return
    }
        
    }


    removeSeason(item, index) {
        let seasonList = this.state.seasonList;
        const idProperty = this.state.hotelData.iddef_property;
        item.estado = 0;
        seasonList[index] = item;
        this.setState({ seasonList: seasonList });


        if (item.estado == 1) {
            const refPeriods = this[`ref-season-${index}-period-${indexPeriods}`];
           
            let dataPeriod = refPeriods.getData()
            
            this.arregloPeriodoUpdate.push({
                "estado": 0,
                "iddef_season": item.iddef_season,
                "end_date": dataPeriod.values.end_date,
                "iddef_period_season": itemPeriods.iddef_period_season == null ? null : itemPeriods.iddef_period_season,
                "start_date": dataPeriod.values.start_date
            });
              
        }

        //PUT
        const idSeason = item.iddef_season
        let arregloUpdate = this.arregloPeriodoUpdate;
        let dataSend = {
             "description": item.description,
             "iddef_property": idProperty,
             "periods": arregloUpdate,
             "estado": 0
         };
        CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/season/update/${idSeason}`, dataSend, (data, error) => {
            //console.warn("RESPONSE: ",data);
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let notificationType = "";
                let notificationMessage = "";
            
                if (!data.Error) {
                    notificationType = "success";
                    notificationMessage = "The data was updated";
                
                } else {
                    notificationType = "error";
                    notificationMessage = "The data was no updated";
                }
                MComponentes.toast(notificationMessage);
            }
        })   

    }

    addPeriod(seasonItem, index) {
        let seasonList = this.state.seasonList;
        let newPeriod = this.getPeriodTemplate();
        seasonItem.periods.push(newPeriod);
        seasonList[index] = seasonItem;

        
        this.setState({ seasonList: seasonList });
    }

    removePeriod(item, index, indexSeason) {
        let seasonList = this.state.seasonList;
        let seasonItem = seasonList[indexSeason];
        item.estado = 0;
        seasonItem.periods[index] = item;
        seasonList[indexSeason] = seasonItem;
        this.setState({ seasonList: seasonList });
    }

    getFormSeason(item, index) {
        return (
            <div key={index} className="row">
                <div className="col s12 m6 l6" >
                    <CleverForm
                        id={`form-season-${index}`}
                        ref={ref => this[`ref-season-${index}`] = ref}
                        data={item}
                        forms={[
                            {
                                inputs: [
                                    {
                                        row: [
                                            { type: 'text', size: 'col s12 m12 l12', label: 'Season name', name: 'description', required: true, uppercase: false, alphanumeric: true },
                                            { type: 'button', size: 'col s6 m6 l6', label: 'Add Period', onClick: () => this.addPeriod(item, index) },
                                        ]
                                    }
                                ]
                            }
                        ]}
                    />
                </div>
                <div className="col s12 m6 l6">
                    
                    {item.periods.map((itemPeriod, indexPeriod) => {
                        if (itemPeriod.estado == 1) {
                            return this.getFormPeriod(itemPeriod, indexPeriod, index)
                        }
                    })}
                </div>
            </div>);
    }

    getFormPeriod(item, index, indexSeason) {
        return (<div key={index} className="row">
            <CleverForm
                id={`form-period-${index}-season-${indexSeason}`}
                ref={ref => this[`ref-season-${indexSeason}-period-${index}`] = ref}
                data={item}
                forms={[
                    {
                        inputs: [
                            {
                                row: [
                                    { type: 'date', colDate: 'col s4 m4 l4', label: 'Start date', name: 'start_date',time: false },
                                    { type: 'date', colDate: 'col s4 m4 l4', label: 'End date', name: 'end_date', time: false },
                                    { type: 'button', size: 'col s4 m4 l4', label: 'Remove', onClick: () => this.removePeriod(item, index, indexSeason) }
                                ]
                            }
                        ]
                    }
                ]}
            />
        </div>);
    }

    render() {
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> }

        const { seasonList } = this.state;
        let heads = [], body = {};

        seasonList.map((item, index) => {
            if (item.estado == 1) {
                const collapsibleName = `season-${index}`;
                const headLabel = item.description ? item.description : "New Season";
                const containerControls = <div className="row">
                    <div className="col l6 m6 s6"><button type='button' className='btn' onClick={() => this.saveSeason(item, index)}>SAVE</button></div>
                    <div className="col l6 m6 s6"><button type='button' className='btn' onClick={() => this.removeSeason(item, index)}>REMOVE</button></div>
                </div>
                
                const head = { accordion: collapsibleName, label: headLabel , controls: [{ control: containerControls }] };
                heads.unshift(head);
                body[collapsibleName] = this.getFormSeason(item, index);
            }
        });

        return (
            <div className="row">
                <div className="col s12 m12 l12">
                    <h5>Seasons</h5>
                    <CleverButton size={'col s12 m2 l2'} icon={'done'} label={'Add season'} fullSize={true} onClick={this.addSeason} />                    
                </div>
                <CleverAccordion
                    id={'seasons-collapsible'}
                    accordion={
                        {
                            head: heads,
                            body: [body],
                        }
                    }
                />                
            </div>
        );
    }
}