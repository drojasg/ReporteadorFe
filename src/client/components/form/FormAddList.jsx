import React from 'react';
import PropTypes from 'prop-types';

import { uniqueID } from 'clever-component-library/build/node/Util';
import { Datepicker } from 'clever-component-library';

import InputText from '../input/InputText';
import InputTextArea from '../input/InputTextArea';
import InputNumber from '../input/InputNumber';
import InputMail from '../input/InputMail';
import InputPhone from '../input/InputPhone';
import InputSelect from '../input/InputSelect';

import InputQuantity from '../input/InputQuantity';

import InputCheckBox from '../input/InputCheckBox';
import InputRadio from '../input/InputRadio';

import Button from '../button/Button';
import ButtonDropdown from '../button/ButtonDropdown';
import InputSwitch from '../input/InputSwitch';

import './form.css';
import InputSearch from '../input/InputSearch';

export default class FormAddList extends React.Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            forms : [],
            data : [],
        };
        this.addElement = this.addElement.bind(this);
        this.removeElement = this.removeElement.bind(this);
        this.getData = this.getData.bind(this);
    };

    componentDidMount()
    {
        this.changeStateData(this.props.data);
        this.changeStateForms(this.props.forms);
    };

    componentDidUpdate(prevProps,prevState)
    {
        if (prevProps.data != this.props.data)
        {
            this.changeStateData(this.props.data);
        }

        if (prevProps.forms != this.props.forms)
        {
            this.changeStateForms(this.props.forms);
        }
    };

    changeStateData(data)
    {
        this.setState({
            data : data,
        },() => {
            this.actionsButtons();
        });
    };

    changeStateForms(forms)
    {
        this.setState({
            forms : forms,
        });
    };

    actionsButtons()
    {
        let keys = this.state.data.length;

        for (let key = 0; key < keys; key++) 
        {
            let rowForm = document.querySelector('div[id=row-form-'+key+']');
            let btnAdd = rowForm.querySelector('button[id=btn-add-row-form-'+key+']');
            let btnRemove = rowForm.querySelector('button[id=btn-remove-row-form-'+key+']');

            if (key == (this.state.data.length-1))
            {
                btnAdd.parentElement.parentElement.parentElement.classList.value = 'inside';
                btnRemove.parentElement.parentElement.parentElement.classList.value = 'outside';
            }
            else
            {
                btnAdd.parentElement.parentElement.parentElement.classList.value = 'outside';
                btnRemove.parentElement.parentElement.parentElement.classList.value = 'inside';
            }
        };
    };

    getData() 
    {
        let rowForm = document.querySelector('div[id='+this.props.id+'].form');
        let inputs = rowForm.querySelectorAll('input,textarea');

        let dataInputs = {};
        let countRequired = 0;
        let valueRadio = '';
        let valueSelectCheckbox = [];
        let phone = {region:'',area:'',number:'',extension:''};

        for (let input of inputs) 
        {
            dataInputs[input.name] = input.value;

            if (input.name == '')
            {
                delete dataInputs[input.name];
            }
            else if (input.required == true && (input.value == '' || input.classList.value == 'invalid' || input.classList.value == 'input-select invalid' || input.classList.value == 'input-phone invalid'))
            {
                input.classList.value = 'invalid';
                countRequired = countRequired+1;
            }
            else
            {
                if (input.type == 'text' && input.classList.value == 'input-select valid')
                {
                    if (input.dataset.selecteds != [])
                    {
                       let selecteds = String(input.dataset.selecteds).split(',');
                       dataInputs[input.name] = [selecteds];
                    }
                    else
                    {
                        dataInputs[input.name] = input.dataset.selected;
                    }

                    input.classList.value = 'input-select valid';
                }
                else if (input.type == 'text' && input.classList.value == 'input-select input-search valid')
                {
                    if (input.value != '')
                    {
                        dataInputs[input.name] = input.value;
                        dataInputs['id_'+input.name] = input.dataset.selected;
                    }
                    else
                    {
                        dataInputs[input.name] = '';
                        dataInputs['id_'+input.name] = '';
                    };

                    input.classList.value = 'input-select input-search valid';
                }
                else if (input.type == 'text' && input.classList.value == 'input-date')
                {
                    dataInputs[input.name] = input.dataset.dateformat;
                }
                else if (input.type == 'search' && input.classList.value == 'input-date')
                {
                    dataInputs[input.name] = input.dataset.dateformat;
                }
                else if (input.type == 'text' && input.classList.value == 'input-date-multiple')
                {
                    dataInputs[input.name] = input.dataset.dateformat;
                }
                else if (input.type == 'number' && input.classList.value == 'valid')
                {
                    let number = Number(input.value);
                    dataInputs[input.name] = number;
                }
                else if (input.type == 'radio' && input.classList.value == 'with-gap')
                {
                    if (input.checked == true)
                    {
                        valueRadio = input.value;
                    }

                    dataInputs[input.name] = valueRadio;
                }
                else if (input.type == 'checkbox' && input.classList.value == 'filled-in')
                {   
                    let valueCheckbox = [];

                    if (input.checked == true)
                    {
                        valueSelectCheckbox.push({[input.name]:input.value});
                    }
                    
                    for (let index = 0; index < valueSelectCheckbox.length; index++) {
                        if (valueSelectCheckbox[index][input.name] != undefined)
                        {
                            valueCheckbox.push(valueSelectCheckbox[index][input.name]);
                        }
                    };
                    
                    dataInputs[input.name] = valueCheckbox;
                }
                else if (input.type == 'text' && input.classList.value == 'input-phone valid')
                {
                    let getName = input.name.split('_')[0];

                    if (input.name == (getName+'_region') && input.value != undefined)
                    {
                        phone.region = input.value+' ';
                        delete dataInputs[input.name];
                    }
                    else if (input.name == (getName+'_area'))
                    {
                        phone.area = input.value+' ';
                        delete dataInputs[input.name];
                    }
                    else if (input.name == (getName+'_number'))
                    {
                        phone.number = input.value;
                        delete dataInputs[input.name];
                    }
                    else if (input.name == (getName+'_extension'))
                    {
                        phone.extension = ' '+input.value;
                        delete dataInputs[input.name];
                    }

                    dataInputs[getName] = phone.region+phone.area+phone.number+phone.extension;
                }
            }
        };

        let date = new Date();
        let dateFormat = date.getFullYear()+'-'+(date.getMonth() < 10 ? '0'+date.getMonth() : date.getMonth())+'-'+(date.getDate() < 10 ? '0'+date.getDate() : date.getDate())+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

        dataInputs['fecha_creacion'] = dateFormat;
        dataInputs['usuario_creacion'] = localStorage.getItem("username");
        dataInputs['fecha_ultima_modificacion'] = dateFormat;
        dataInputs['usuario_ultima_modificacion'] = localStorage.getItem("username");
        
        let data = {values:dataInputs, required:countRequired};

        return data;
    };

    addElement(key)
    {
        let rowForm = document.querySelector('div[id=row-form-'+key+']');
        let inputs = rowForm.querySelectorAll('input');
        let btnAdd = rowForm.querySelector('button[id=btn-add-row-form-'+key+']');
        let btnRemove = rowForm.querySelector('button[id=btn-remove-row-form-'+key+']');

        let countRequired = 0;

        for (let input of inputs) 
        {
            if (input.required == true && input.value == '')
            {
                countRequired = countRequired+1;
            }
        };

        if (countRequired == 0)
        {
            let data = this.state.data;
            data.push({})

            this.setState({
                data : data
            })

            btnAdd.parentElement.parentElement.parentElement.classList.value = 'outside';
            btnRemove.parentElement.parentElement.parentElement.classList.value = 'inside';
        }
    };

    removeElement(key)
    {
        let data = this.state.data;
        delete data[key];
        
        this.setState({
            data : data,
        });
    };

    render() 
    {
        return (
            <div ref={ref => this.refFormAddList = ref} id={this.props.id} className='form'>
                {
                    this.state.data.map((rowDataForm, keyRowDataForm) => {
                        return(
                            <div id={'row-form-'+keyRowDataForm} key={'row-form-'+keyRowDataForm} className='col s12 m12 l12'>
                                {
                                    this.state.forms.map((input,keyInput) => {
                                        return(
                                            <div key={'input-'+keyInput}>
                                            {
                                                (() => {
                                                    switch (input.type) 
                                                    {
                                                        /* basic inputs */
                                                        case 'text':
                                                        {
                                                            return(
                                                                <InputText id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} icon={input.icon} name={input.name+'-'+keyRowDataForm} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} alphanumeric={input.alphanumeric} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                            );
                                                        }
                                                        case 'text-area':
                                                        {
                                                            return(
                                                                <InputTextArea id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} icon={input.icon} name={input.name+'-'+keyRowDataForm} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                            );
                                                        }
                                                        case 'number':
                                                        {
                                                            return(
                                                                <InputNumber id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} icon={input.icon} name={input.name+'-'+keyRowDataForm} label={input.label} inline={input.inline} min={input.min} max={input.max} decimal={input.decimal} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                            );
                                                        } 
                                                        case 'email':
                                                        {
                                                            return(
                                                                <InputMail id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} icon={input.icon} name={input.name+'-'+keyRowDataForm} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                            );
                                                        }
                                                        case 'phone':
                                                        {
                                                            return(
                                                                <InputPhone id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} icon={input.icon} name={input.name+'-'+keyRowDataForm} labelRegion={input.labelRegion} labelArea={input.labelArea} labelNumber={input.labelNumber} labelExtension={input.labelExtension} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} region={input.region} area={input.area} extension={input.extension} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                            );
                                                        }
                                                        case 'date':
                                                        {
                                                            return(
                                                                <Datepicker selected={input.selected} name={input.name+'-'+keyRowDataForm} formatTime={input.formatTime} defaultTime={input.defaultTime} time={input.time} defaultValue={this.state.data[input.name]} viewLabel={input.viewLabel} onChange={input.onChange} calculateDays={input.calculateDays} min={input.min} placeholder={input.placeholder} colTime={input.colTime} colDate={input.colDate} required={input.required} disabled={input.disabled} labelDate={input.labelDate} labelTime={input.labelTime} nights={input.nights} colNight={input.colNight}/>
                                                            );
                                                        }
                                                        case 'select':
                                                        {
                                                            return(
                                                                <InputSelect id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} icon={input.icon} name={input.name+'-'+keyRowDataForm} label={input.label} inline={input.inline} placeholder={input.placeholder} multiple={input.multiple} options={input.options} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} autocomplete={input.autocomplete} uppercase={input.uppercase} lowercase={input.lowercase} capitalize={input.capitalize} joinOn={input.joinOn} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>        
                                                            );
                                                        }
                                                        case 'quantity':
                                                        {
                                                            return(
                                                                <InputQuantity id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} icon={input.icon} name={input.name+'-'+keyRowDataForm} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                            )
                                                        }
                                                        case 'checkbox':
                                                        {
                                                            return(
                                                                <InputCheckBox id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} name={input.name+'-'+keyRowDataForm} label={input.label} onChange={input.onChange} checkboxs={input.checkboxs} defaultValues={this.state.data[input.name]}/>
                                                            );
                                                        }
                                                        case 'radio':
                                                        {
                                                            return(
                                                                <InputRadio id={this.props.id + '-' + input.name} size={input.size} name={input.name+'-'+keyRowDataForm} label={input.label} onChange={input.onChange} radios={input.radios} defaultValue={this.state.data[input.name]}/>
                                                            );
                                                        }
                                                        case 'switch':
                                                        {
                                                            return(
                                                                <InputSwitch id={this.props.id+'-'+input.name+'-'+keyRowDataForm} name={input.name+'-'+keyRowDataForm} size={input.size} label1={input.label1} label2={input.label2} color1={input.colo1} color2={input.color2} onChange={input.onChange} hidden={input.hidden} required={input.required} disabled={input.disabled}/>
                                                            );
                                                        }
                                                        case 'search':
                                                        {
                                                            return(
                                                                <InputSearch id={this.props.id+'-'+input.name+'-'+keyRowDataForm} size={input.size} name={input.name+'-'+keyRowDataForm} label={input.label} onKeyPress={input.onKeyPress} uppercase={input.uppercase} lowercase={input.lowercase} capitalize={input.capitalize}/>
                                                            );
                                                        }
                                                        /* buttons */
                                                        case 'button':
                                                        {
                                                            return(
                                                                <Button id={this.props.id+'-'+input.label+'-'+keyRowDataForm} size={input.size} icon={input.icon} label={input.label} fullSize={input.fullSize} onClick={input.onClick} hidden={input.hidden} disabled={input.disabled} loading={input.loading}/>
                                                            );
                                                        }
                                                        /* components */
                                                        case 'component':
                                                        {
                                                            return(
                                                                input.component
                                                            );
                                                        }
                                                        default:
                                                        {
                                                            return(
                                                                <div className='col'>type of input not supported</div>
                                                            );
                                                        };
                                                    }
                                                })()
                                            }
                                            </div>
                                        );
                                    })
                                }
                                <Button id={'btn-add-row-form-'+keyRowDataForm} size={this.props.btnSize} icon={'add'} color={'green'} fullSize={true} onClick={() => this.addElement(keyRowDataForm)} hidden={false}/>
                                <Button id={'btn-remove-row-form-'+keyRowDataForm} size={this.props.btnSize} icon={'clear'} color={'red'} fullSize={true} onClick={() => this.removeElement(keyRowDataForm)} hidden={true}/>
                            </div>
                        );
                    })
                }
            </div>
        );
    };
};

FormAddList.propTypes = {
    id : PropTypes.string,
    forms : PropTypes.array,
    data : PropTypes.array,
    btnSize : PropTypes.string,
};

FormAddList.defaultProps = {
    id : uniqueID(),
    forms : [],
    data : [{}],
    btnSize : 'col s12 m2 l2',
};