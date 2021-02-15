import React, { Component } from 'react';
import { CleverForm } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";


export default class Occupancy extends Component {
   constructor(props) {
       super(props)
       this.handlerAddRoomType = this.handlerAddRoomType.bind(this);
       this.addExclusion = this.addExclusion.bind(this);
       this.removeExclusion = this.removeExclusion.bind(this);
       this.refForm = React.createRef();
       this.state = {
            dataForm: {
                max_ocupancy: '',
                min_ocupancy: '',
                standar_ocupancy: '',
                min_adt: '',
                max_adt: '',
                min_chd: '',
                max_chd: '',
                acept_chd: ''
            },
            ExclusionList: [{
                "adults": "",
                "childs": "",
                "estado": 1
            }],
       }
       this.arrayExclusion = [
        {
            "adults": "",
            "childs": "",
            "estado": 1
        }
       ];
   }

    componentDidMount() {
        this.getFormExclusion();
        // this.setState({ dataForm: this.props.dataUpdateGeneral });        
        this.props.reference.current.id ?
           document.getElementById(this.props.reference.current.id).addEventListener("click", this.handlerAddRoomType)
           : null;
    }

    componentDidUpdate(prevProps, prevState){
        if (this.props.dataUpdateOcupacy !== prevProps.dataUpdateOcupacy) {
            if (this.props.dataUpdateOcupacy == '') {
                this.fetchCreate();
            }else{
                this.fetchUpdate();
            }
        }
    }

    fetchUpdate = async () => {
        let dataUpdateOcupacy = this.props.dataUpdateOcupacy;
        let acept_chd = (dataUpdateOcupacy.acept_chd == 1)? ["Acept child"] : [""];      

        let update = {
            max_ocupancy: `${dataUpdateOcupacy.max_ocupancy}`,
            min_ocupancy: `${dataUpdateOcupacy.min_ocupancy}`,
            standar_ocupancy: `${dataUpdateOcupacy.standar_ocupancy}`,
            min_adt: `${dataUpdateOcupacy.min_adt}`,
            max_adt: `${dataUpdateOcupacy.max_adt}`,
            min_chd: `${dataUpdateOcupacy.min_chd}`,
            max_chd: `${dataUpdateOcupacy.max_chd}`,
            acept_chd: acept_chd
        };
        
        this.setState({ dataForm: update });
    }

    fetchCreate(){
        let update = {
            max_ocupancy: '',
            min_ocupancy: '',
            standar_ocupancy: '',
            min_adt: '',
            max_adt: '',
            min_chd: '',
            max_chd: '',
        };
        
        this.setState({ dataForm: update });
    }

    handlerAddRoomType(){
        // const ExclusionList = this.state.ExclusionList;
        // this.saveExclusion = [];
        // ExclusionList.map((item, index) => {
        //     if (item.estado == 1) {
        //         this.saveExclusion.push(this[`ref-exclusion-${index}`].getData());
        //         // console.log(`[DATA SEASON ${index}]`, this[`ref-exclusion-${index}`].getData());
        //     }
        // });
        let occupancyForm = this.OccupancyForm.getData();
        this.request = {};

        this.request.max_ocupancy = occupancyForm.values.max_ocupancy;
        this.request.min_ocupancy = occupancyForm.values.min_ocupancy;
        this.request.standar_ocupancy = occupancyForm.values.standar_ocupancy;
        this.request.min_adt = occupancyForm.values.min_adt;
        this.request.max_adt = occupancyForm.values.max_adt;
        this.request.min_chd = occupancyForm.values.min_chd;
        this.request.max_chd = occupancyForm.values.max_chd;
        var acept_chd = (occupancyForm.values.acept_chd.length > 0)? 1 : 0;
        this.request.acept_chd = acept_chd;

        this.props.getForms(this.request);
        // console.log(this.OccupancyForm.getData());
        // console.log(this.saveExclusion);
        // console.log(this.props.reference);
    }


    getExclusionTemplate() {
        return {
            "adults": "",
            "childs": "",
            "estado": 1
        };
    }
    
    removeExclusion(item, index) {
        let ExclusionList = this.state.ExclusionList;
        // let ExclusionItem = ExclusionList[index];
        item.estado = 0;
        // ExclusionItem[index] = item;
        // ExclusionList[index] = ExclusionItem;
        
        // console.warn(ExclusionList);
        this.setState({ ExclusionList: ExclusionList });
    }

    addExclusion() {
        let ExclusionList = this.state.ExclusionList;
        let newExclusion = this.getExclusionTemplate();
        this.arrayExclusion.push(newExclusion);
        // console.warn(ExclusionList);

        this.setState({ ExclusionList: this.arrayExclusion });

        this.getFormExclusion();
       
    }

    getFormExclusion() {
        return (<div className="col s12 m12 l12">
            {this.arrayExclusion.map((itemExclusion, indexExclusion) => {
                if (itemExclusion.estado == 1) {
                    return (<div key={indexExclusion} className="row">
                        <CleverForm
                            id={`ref-exclusion-${indexExclusion}`}
                            ref={ref => this[`ref-exclusion-${indexExclusion}`] = ref}
                            data={itemExclusion}
                            forms={[
                                {
                                    inputs: [
                                        {row: [
                                            {type:'component', 
                                                component:() =>{
                                                    return (
                                                        <div>
                                                            <div className='col s12 m12 l4'>
                                                                <label>Adults: </label>
                                                                <input type='number' name ='adults' placeholder='Adults'></input>
                                                            </div>
                                                            <div className='col s12 m12 l4'>
                                                                <label>Child: </label>
                                                                <input type='number' name ='childs' placeholder='Child'></input>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            },
                                            { type: 'button', size: 'col s4 m4 l4', label: 'Remove', onClick: () => this.removeExclusion(itemExclusion, indexExclusion) }
                                        ]},
                                    ]
                                }
                            ]}
                        />
                    </div>)
                }
            })}
        </div>);
    }


    render() {
        var exclusion = this.getFormExclusion();
        return (
            <div className="row">
                <div className='col s12 m12 l12'>
                    <CleverForm
                        id={'OccupancyForm'}
                        ref={ref => this.OccupancyForm = ref}
                        data={this.state.dataForm}
                        forms={[
                            { 
                                inputs:[
                                    {row: [
                                        {type:'component', 
                                            component:() =>{
                                                return (
                                                    <div>
                                                        <div className='col s12 m12 l12'>
                                                            <label>Occupancy: </label>
                                                        </div>
                                                        <div className='col s12 m12 l6'>
                                                            <div className='col s12 m12 l4'>
                                                                <label>Minimum: </label>
                                                                <input type='number' name ='min_ocupancy' placeholder='Minimum' defaultValue={this.state.dataForm.min_ocupancy}></input>
                                                            </div>
                                                            <div className='col s12 m12 l4'>
                                                                <label>Standard: </label>
                                                                <input type='number' name ='standar_ocupancy' placeholder='Standard' defaultValue={this.state.dataForm.standar_ocupancy}></input>
                                                            </div>

                                                            <div className='col s12 m12 l4'>
                                                                <label>Maximum: </label>
                                                                <input type='number' name ='max_ocupancy' placeholder='Maximum' defaultValue={this.state.dataForm.max_ocupancy}></input>
                                                            </div>
                                                        </div>
                                                        <div className='col s12 m12 l6'>
                                                            <div className='col s12 m12 l4'>
                                                                <label>Adults Minimum/Maximum: </label>
                                                            </div>
                                                            <div className='col s12 m12 l8'>
                                                                <div className='col s12 m12 l6'>
                                                                    <input type='number' name ='min_adt' placeholder='Adults Minimum' defaultValue={this.state.dataForm.min_adt}></input>
                                                                </div>
                                                                <div className='col s12 m12 l6'>
                                                                    <input type='number' name ='max_adt' placeholder='Adults Maximum' defaultValue={this.state.dataForm.max_adt}></input>
                                                                </div>
                                                            </div>
                                                            <div className='col s12 m12 l4'>
                                                                <label>Child Minimum/Maximum: </label>
                                                            </div>
                                                            <div className='col s12 m12 l8'>
                                                                <div className='col s12 m12 l6'>
                                                                    <input type='number' name ='min_chd' placeholder='Child Minimum' defaultValue={this.state.dataForm.min_chd}></input>
                                                                </div>
                                                                <div className='col s12 m12 l6'>
                                                                    <input type='number' name ='max_chd' placeholder='Child Maximum' defaultValue={this.state.dataForm.max_chd}></input>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }   
                                        },
                                    ]},
                                    {row: [
                                        {type:'checkbox',size:'col s12 m12 l4',name:'acept_chd', checkboxs:[{value:'Acept child', label:'Acept child'}]}
                                    ]},
                                ],
                            }, 
                        ]}
                    />
                </div>
                {/* <div className='col s12 m12 l6'>
                    <div className='col s12 m12 l12'>
                        <div className='col s12 m12 l6'>
                            <label>Exclusions: </label>
                        </div>
                        <div className='col s12 m12 l6'>
                            <button type='button' onClick={this.addExclusion} id="addExclusion" className='btn'>ADD EXCLUSION</button>
                        </div>
                    </div>
                    {exclusion}
                </div> */}
            </div>
        )
    }
}