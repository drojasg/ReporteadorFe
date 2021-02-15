import React, { Component } from 'react';
import { CleverForm, CleverRequest, CleverLoading } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";

export default class GeneralInfo extends Component {
   constructor(props) {
       super(props)
       this.handlerAddRoomType = this.handlerAddRoomType.bind(this);
       this.refForm = React.createRef();
       this.state = {
            optionsSelect: '',
            dataForm: {},
            load: false,
            optionArea:[],
            dataMarket:[],
            viewMarket:true,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
       }
       this.arrayLanguages = new Array();
       this.Form = new Array();
   }

    componentDidMount() {
        this.getByLanguages();
        this.getOptionsMarket();
        this.getAreaUnit();
        this.setState({ dataForm: this.props.dataUpdateGeneral });
        this.props.reference.current.id ?
           document.getElementById(this.props.reference.current.id).addEventListener("click", this.handlerAddRoomType)
           : null;
    }

    componentDidUpdate(prevProps, prevState){
        if (this.props.dataUpdateGeneral !== prevProps.dataUpdateGeneral) {
            if (this.props.dataUpdateGeneral.order !== undefined) {
                this.fetchCreate();
            }else{
                this.getOptionsMarket(()=>{
                    this.fetchUpdate();  
                });             
            }
        }
    }

    fetchUpdate = async () => {
        let dataUpdateGeneral = this.props.dataUpdateGeneral;
        
        let smoking = (dataUpdateGeneral.smoking == 1)? ["Smoking"] : [""];
        let update = {
            area: `${dataUpdateGeneral.area}`,
            area_unit: `${dataUpdateGeneral.area_unit}`,
            room_code: `${dataUpdateGeneral.room_code}`,
            room_order: `${dataUpdateGeneral.room_order}`,
            estado: 1,
            smoking: smoking,
            market_option:`${dataUpdateGeneral.market_option}`,
            market_targeting:dataUpdateGeneral.market_targeting !== undefined ? dataUpdateGeneral.market_targeting :[]
        };
        this.getByLanguages(update);
        this.getAreaUnit(update);
    }

    fetchCreate= async () =>{
        let update = {
            area: '',
            area_unit: '',
            room_code: '',
            room_order: this.props.dataUpdateGeneral.order+1,
            estado: 0,
            market_option:'',
            market_targeting:'',
            description_new:[]
            
        };
        this.setState({ dataForm: null },()=>{
            this.getByLanguages(update);
            this.getAreaUnit(update);
            // this.getOptionsMarket(update);              
        })
        
    }

    getAreaUnit = async (update) => {
        this.setState({ load: true });
        let property = this.state.hotelData.iddef_property;
        let option = [];  
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/area-unit/get?all=`+ property, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (response.Error==false) {
                response.data.map((item, key) =>{
                    option.push({ value: item.iddef_area_unit , option: item.unit_code });
                });

                // this.getCleverForms(this.option, update);
                this.setState({optionArea:option,dataForm:update})
            }
        });

    }

    getOptionsMarket(functionMarket=()=>{}) {
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/market/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false },functionMarket);
                return
            }
            if (!error) {
                if (response != null) {
                    var jotason = []
                    for (let index = 0; index < response.data.length; index++) {
                        jotason.push({ value: response.data[index].code, option: response.data[index].code+" - "+response.data[index].description })
                    }
                    this.setState({dataMarket : jotason},functionMarket)
                }else{ this.setState({dataMarket : []},functionMarket)}
            }
            else {
                 MComponentes.toast("ERROR");
                console.log(error)
                this.setState({dataMarket : []},functionMarket)
            };
        });
    }

    optionMarkets= async (e)=>{        
        let valueOption= parseInt(e.value);
        if(valueOption == 0 || valueOption==''){
            this.setState({viewMarket:true});
        }else{
            this.setState({viewMarket:false});
        }
    }
  

    handlerAddRoomType(){
        let generalForms = this.GeneralForm.getData();
        this.request = {};
        this.names = [];
        Object.keys(generalForms.values).map((item, key) =>{
            for (let i = 0; i < this.props.language.length; i++) {
                const element = this.props.language[i];
                let language_tem = 'language_code_'+element.language_code;
                if (item == language_tem) {
                    // language_code_EN || language_code_EN
                    this.names.push({
                        'lang_code': element.language_code,
                        'text': generalForms.values[item]
                    });
                }
            }
        });

        
        this.request.room_code = generalForms.values.room_code;
        this.request.area = generalForms.values.area;
        this.request.area_unit = generalForms.values.area_unit;
        this.request.room_order = generalForms.values.room_order;
        // this.request.room_type = generalForms.values.room_type;
        // this.request.total_rooms = generalForms.values.total_rooms;
        let Smoking = (generalForms.values.smoking.length > 0)? 1 : 0;
        this.request.smoking = Smoking;
        this.request.names = this.names;
        this.request.market_option = generalForms.values.market_option;
        this.request.market_targeting = generalForms.values.market_option !== "0" ? generalForms.values.market_targeting :[];

        this.props.getForms(this.request);
        // console.log(this.GeneralForm.getData());
        // console.log(this.props.reference);
    }

    getByLanguages = async (update) => {
        this.arrayLanguages = [];
        let tmpItem = [];


        this.props.language.map((item, key) => {
            if (update == undefined) {
                tmpItem.text = '';                
            }else{
                if (update.estado == 1 && this.props.dataUpdateGeneral.description_new !== undefined) {
                    this.props.dataUpdateGeneral.description_new.find(langItem => {
                        if (langItem.lang_code.toLowerCase() == item.language_code.toLowerCase()) {
                            tmpItem.text = langItem.text;
                        }
                    });
                }else{
                    tmpItem.text = '';
                }
            }

            this.arrayLanguages.push(
                <div className='col s12 m12 l6' key={key}>
                    <label key={key}>Room type name ({item.language})</label>,
                    <input type='text' id={key} name={'language_code'+'_'+item.language_code} placeholder='Room type name' defaultValue={tmpItem.text}></input>
                </div>
            );
        });        
    }

    render() {
        let {load,dataForm,optionArea,dataMarket,viewMarket}= this.state;
        (load == true)? <CleverLoading show={true}/> : null;
        return (
            <div className="row">
                {dataForm && dataForm !== null?
                    <CleverForm
                        id={'GeneralForm'}
                        ref={ref => this.GeneralForm = ref}
                        data={dataForm}
                        forms={[
                            { 
                                inputs:[
                                    {row: [
                                        {type:'component', 
                                        component:() =>{
                                            return (
                                                <div>
                                                    {this.arrayLanguages}
                                                </div>
                                            );
                                        }   
                                    },
                                    ]},
                                    {row: [
                                        {type:'text',size:'col s12 m3 l3',name:'room_code',label:'Room code'},
                                        {type:'number',size:'col s12 m3 l3',name:'area',label:'Room size'},
                                        {type:'select',size:'col s12 m2 l2',name:'area_unit',label:'format',
                                            options: optionArea
                                        },
                                        {type:'number',size:'col s12 m2 l2',name:'room_order',label:'Room order'},
                                        {type:'checkbox',size:'col s12 m2 l2',name:'smoking',checkboxs:[{value:'Smoking', label:'Smoking'}]}
                                    ]},
                                    {row:[
                                            { type: 'radio',onChange: (e) => this.optionMarkets(e), 
                                                size: 'col s12 m4 l4', label: 'Available Market', name: 'market_option', 
                                                radios: [{ value: "0", label: 'All markets' }, 
                                                { value: "1", label: 'Custom markets' }, 
                                                { value: "2", label: ' All markets, with these exceptions' }] 
                                            },
                                            {
                                                type: 'select', size: 'col s12 m6 l6',
                                                name: 'market_targeting', label: 'Markets',
                                                autocomplete:true,
                                                options: dataMarket,
                                                hidden : dataForm.market_option == "" ? true :viewMarket,
                                                multiple: true
                                            }
                                        ]
                                    },
                                ],
                            }, 
                        ]}
                    />
                :null}
            </div>
        )
    }
}