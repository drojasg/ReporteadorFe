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

export default class Form extends React.Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            forms : [],
            data : {},
        };
        this.getData = this.getData.bind(this);
        this.toggleFieldset = this.toggleFieldset.bind(this);
    };

    componentDidMount()
    {
        this.changeStateData(this.props.data);
        this.changeStateForms(this.props.forms);
        this.changeStateBtnAdditionals(this.props.btnAdditionals);
        this.changeStateBtnDropdowns(this.props.btnDropdowns);
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

        if (prevProps.btnAdditionals != this.props.btnAdditionals)
        {
            this.changeStateBtnAdditionals(this.props.btnAdditionals);
        }

        if (prevProps.btnDropdowns != this.props.btnDropdowns)
        {
            this.changeStateBtnDropdowns(this.props.btnDropdowns);
        }
    };

    changeStateData(data)
    {
        this.setState({
            data : data,
        });
    };

    changeStateForms(forms)
    {
        if (this.props.disabled == true)
        {
            forms.map(form => {
                form.inputs.map(section => {
                    section.row.map(input => {
                        input.disabled = true;
                    });
                });
            });
        }

        this.setState({
            forms : forms,
        });
    };

    changeStateBtnDropdowns(btnDropdowns)
    {
        this.setState({
            btnDropdowns : btnDropdowns,
        });
    };

    changeStateBtnAdditionals(btnAdditionals)
    {
        this.setState({
            btnAdditionals : btnAdditionals,
        });
    };

    getData() 
    {
        let form = document.querySelector('form[id='+this.props.id+']');
        let inputs = form.querySelectorAll('input,textarea');

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

    toggleFieldset(e)
    {
        let fieldset = e.target.parentElement.parentElement.children[1];

        if (fieldset.classList.value == 'outside')
        {
            fieldset.classList.value = 'inside';
            e.target.innerText = 'Hide '+e.target.name;
        }
        else if (fieldset.classList.value == 'inside')
        {
            fieldset.classList.value = 'outside';
            e.target.innerText = 'Show '+e.target.name;
        };
    };

    onSubmit(e)
    {
        e.preventDefault();
    };

    changeInputChild(input)
    {
        let newData = this.state.data;
        newData[input.name] = input.value;
        
        this.setState({
            data : newData,
        });
    };

    render() 
    {
        return (
            <form className='form' id={this.props.id} ref={ref => this.refForm = ref} autoComplete='off' onSubmit={this.onSubmit}>
                {
                    this.state.forms.map((section,keySection) => {
                        return(
                            <div key={'section-'+keySection} className={section.size ? section.size : 'col s12 m12 l12'}>
                                <div style={{textAlign:'right'}}>
                                {
                                    section.hidden == true 
                                    ? 
                                    <a className='btn btn-link' name={section.title} onClick={this.toggleFieldset}>Show {section.title ? section.title : 'more'}</a> 
                                    : null
                                }
                                </div>
                                <div name={'form-section-'+section.title} className={section.hidden == true ? 'outside' : 'inside'}>
                                {
                                    section.fieldset == true 
                                    ? 
                                    <fieldset>
                                        <legend>
                                            {section.title}
                                        </legend>
                                        {
                                            section.inline == true
                                            ?
                                            <div className='row'>
                                                <table className='form-table'>
                                                    <tbody>
                                                        {
                                                            section.inputs.map((input,keyInput) => {
                                                                return(
                                                                    <tr key={'input-'+keyInput}>
                                                                        {
                                                                            (() => {
                                                                                switch (input.type) 
                                                                                {
                                                                                    /* basic inputs */
                                                                                    case 'text':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputText id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} alphanumeric={input.alphanumeric} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    case 'text-area':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputTextArea id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    case 'number':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputNumber id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} min={input.min} max={input.max} decimal={input.decimal} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    } 
                                                                                    case 'email':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputMail id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    case 'phone':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputPhone id={this.props.id+'-'+input.name} sizeRegion={input.sizeRegion} sizeArea={input.sizeArea} sizeNumber={input.sizeNumber} sizeExtension={input.sizeExtension} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} region={input.region} area={input.area} extension={input.extension} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    case 'date':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.labelDate}</td>
                                                                                                <td><Datepicker selected={input.selected} name={input.name} formatTime={input.formatTime} defaultTime={input.defaultTime} time={input.time} defaultValue={this.state.data[input.name]} viewLabel={input.viewLabel} onChange={input.onChange} calculateDays={input.calculateDays} min={input.min} placeholder={input.placeholder} colTime={input.colTime} colDate={input.colDate} required={input.required} disabled={input.disabled} nights={input.nights} colNight={input.colNight}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    case 'select':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputSelect id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} multiple={input.multiple} options={input.options} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} autocomplete={input.autocomplete} uppercase={input.uppercase} lowercase={input.lowercase} capitalize={input.capitalize} joinOn={input.joinOn} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    case 'quantity':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputQuantity id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                            </React.Fragment>
                                                                                        )
                                                                                    }
                                                                                    case 'checkbox':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputCheckBox id={this.props.id+'-'+input.name} size={input.size} name={input.name} onChange={(input) => {this.changeInputChild(input);input.onChange}} checkboxs={input.checkboxs} defaultValues={this.state.data[input.name]}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    case 'radio':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td>{input.label}</td>
                                                                                                <td><InputRadio id={this.props.id + '-' + input.name} size={input.size} name={input.name} onChange={(input) => { this.changeInputChild(input); input.onChange }} radios={input.radios} defaultValue={this.state.data[input.name]}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    case 'switch':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td></td>
                                                                                                <td><InputSwitch id={this.props.id+'-'+input.name} name={input.name} size={input.size} label1={input.label1} label2={input.label2} color1={input.colo1} color2={input.color2} onChange={(input) => {this.changeInputChild(input);input.onChange}} hidden={input.hidden} required={input.required} disabled={input.disabled}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    /* buttons */
                                                                                    case 'button':
                                                                                    {
                                                                                        return(
                                                                                            <React.Fragment>
                                                                                                <td></td>
                                                                                                <td><Button id={this.props.id+'-'+input.label} size={input.size} icon={input.icon} label={input.label} fullSize={input.fullSize} onClick={input.onClick} hidden={input.hidden} disabled={input.disabled} loading={input.loading}/></td>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    }
                                                                                    /* components */
                                                                                    case 'component':
                                                                                    {
                                                                                        return(
                                                                                            typeof input.component === 'function'
                                                                                            ?
                                                                                            <React.Fragment>
                                                                                                <td></td>
                                                                                                <td>{input.component()}</td>
                                                                                            </React.Fragment>
                                                                                            : null
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
                                                                    </tr>
                                                                );
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                            :
                                                    section.inputs.map((rows,keyRow) => {
                                                        return(
                                                            <div key={'row-'+keyRow} className='row' style={{marginBottom:0}}>
                                                                {
                                                                    rows.row.map((input,keyInput) => {
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
                                                                                                <InputText id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} alphanumeric={input.alphanumeric} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                                            );
                                                                                        }
                                                                                        case 'text-area':
                                                                                        {
                                                                                            return(
                                                                                                <InputTextArea id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                                            );
                                                                                        }
                                                                                        case 'number':
                                                                                        {
                                                                                            return(
                                                                                                <InputNumber id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} min={input.min} max={input.max} decimal={input.decimal} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                                            );
                                                                                        } 
                                                                                        case 'email':
                                                                                        {
                                                                                            return(
                                                                                                <InputMail id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                                            );
                                                                                        }
                                                                                        case 'phone':
                                                                                        {
                                                                                            return(
                                                                                                <InputPhone id={this.props.id+'-'+input.name} sizeRegion={input.sizeRegion} sizeArea={input.sizeArea} sizeNumber={input.sizeNumber} sizeExtension={input.sizeExtension} icon={input.icon} name={input.name} labelRegion={input.labelRegion} labelArea={input.labelArea} labelNumber={input.labelNumber} labelExtension={input.labelExtension} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} region={input.region} area={input.area} extension={input.extension} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                                            );
                                                                                        }
                                                                                        case 'date':
                                                                                        {
                                                                                            return(
                                                                                                <Datepicker selected={input.selected} name={input.name} formatTime={input.formatTime} defaultTime={input.defaultTime} time={input.time} defaultValue={this.state.data[input.name]} viewLabel={input.viewLabel} onChange={input.onChange} calculateDays={input.calculateDays} min={input.min} placeholder={input.placeholder} colTime={input.colTime} colDate={input.colDate} required={input.required} disabled={input.disabled} labelDate={input.labelDate} labelTime={input.labelTime} nights={input.nights} colNight={input.colNight}/>
                                                                                            );
                                                                                        }
                                                                                        case 'select':
                                                                                        {
                                                                                            return(
                                                                                                <InputSelect id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} multiple={input.multiple} options={input.options} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} autocomplete={input.autocomplete} uppercase={input.uppercase} lowercase={input.lowercase} capitalize={input.capitalize} joinOn={input.joinOn} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>        
                                                                                            );
                                                                                        }
                                                                                        case 'quantity':
                                                                                        {
                                                                                            return(
                                                                                                <InputQuantity id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                                            )
                                                                                        }
                                                                                        case 'checkbox':
                                                                                        {
                                                                                            return(
                                                                                                <InputCheckBox id={this.props.id+'-'+input.name} size={input.size} name={input.name} label={input.label} onChange={input.onChange} checkboxs={input.checkboxs} defaultValues={this.state.data[input.name]}/>
                                                                                            );
                                                                                        }
                                                                                        case 'radio':
                                                                                        {
                                                                                            return(
                                                                                                <InputRadio id={this.props.id + '-' + input.name} size={input.size} name={input.name} label={input.label} onChange={input.onChange} radios={input.radios} defaultValue={this.state.data[input.name]}/>
                                                                                            );
                                                                                        }
                                                                                        case 'switch':
                                                                                        {
                                                                                            return(
                                                                                                <InputSwitch id={this.props.id+'-'+input.name} name={input.name} size={input.size} label1={input.label1} label2={input.label2} color1={input.colo1} color2={input.color2} onChange={(input) => {this.changeInputChild(input);input.onChange}} hidden={input.hidden} required={input.required} disabled={input.disabled}/>
                                                                                            );
                                                                                        }
                                                                                        /* buttons */
                                                                                        case 'button':
                                                                                        {
                                                                                            return(
                                                                                                <Button id={this.props.id+'-'+input.label} size={input.size} icon={input.icon} label={input.label} fullSize={input.fullSize} onClick={input.onClick} hidden={input.hidden} disabled={input.disabled} loading={input.loading}/>
                                                                                            );
                                                                                        }
                                                                                        /* components */
                                                                                        case 'component':
                                                                                        {
                                                                                            return(
                                                                                                typeof input.component === 'function'
                                                                                                ?
                                                                                                input.component()
                                                                                                : null
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
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        );
                                                    })
                                                
                                        }
                                    </fieldset> 
                                    : 
                                    section.inline == true
                                    ?
                                    <div className='row'>
                                        <table className='form-table'>
                                            <tbody>
                                                {
                                                    section.inputs.map((input,keyInput) => {
                                                        return(
                                                            <tr key={'input-'+keyInput}>
                                                                {
                                                                    (() => {
                                                                        switch (input.type) 
                                                                        {
                                                                            /* basic inputs */
                                                                            case 'text':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputText id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} alphanumeric={input.alphanumeric} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            case 'text-area':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputTextArea id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            case 'number':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputNumber id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} min={input.min} max={input.max} decimal={input.decimal} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            } 
                                                                            case 'email':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputMail id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            case 'phone':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputPhone id={this.props.id+'-'+input.name} sizeRegion={input.sizeRegion} sizeArea={input.sizeArea} sizeNumber={input.sizeNumber} sizeExtension={input.sizeExtension} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} region={input.region} area={input.area} extension={input.extension} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            case 'date':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.labelDate}</td>
                                                                                        <td><Datepicker selected={input.selected} name={input.name} formatTime={input.formatTime} defaultTime={input.defaultTime} time={input.time} defaultValue={this.state.data[input.name]} viewLabel={input.viewLabel} onChange={input.onChange} calculateDays={input.calculateDays} min={input.min} placeholder={input.placeholder} colTime={input.colTime} colDate={input.colDate} required={input.required} disabled={input.disabled} nights={input.nights} colNight={input.colNight}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            case 'select':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputSelect id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} multiple={input.multiple} options={input.options} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} autocomplete={input.autocomplete} uppercase={input.uppercase} lowercase={input.lowercase} capitalize={input.capitalize} joinOn={input.joinOn} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            case 'quantity':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputQuantity id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/></td>
                                                                                    </React.Fragment>
                                                                                )
                                                                            }
                                                                            case 'checkbox':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputCheckBox id={this.props.id+'-'+input.name} size={input.size} name={input.name} onChange={(input) => {this.changeInputChild(input);input.onChange}} checkboxs={input.checkboxs} defaultValues={this.state.data[input.name]}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            case 'radio':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td>{input.label}</td>
                                                                                        <td><InputRadio id={this.props.id + '-' + input.name} size={input.size} name={input.name} onChange={(input) => { this.changeInputChild(input); input.onChange }} radios={input.radios} defaultValue={this.state.data[input.name]}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            case 'switch':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td></td>
                                                                                        <td><InputSwitch id={this.props.id+'-'+input.name} name={input.name} size={input.size} label1={input.label1} label2={input.label2} color1={input.colo1} color2={input.color2} onChange={(input) => {this.changeInputChild(input);input.onChange}} hidden={input.hidden} required={input.required} disabled={input.disabled}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            /* buttons */
                                                                            case 'button':
                                                                            {
                                                                                return(
                                                                                    <React.Fragment>
                                                                                        <td></td>
                                                                                        <td><Button id={this.props.id+'-'+input.label} size={input.size} icon={input.icon} label={input.label} fullSize={input.fullSize} onClick={input.onClick} hidden={input.hidden} disabled={input.disabled} loading={input.loading}/></td>
                                                                                    </React.Fragment>
                                                                                );
                                                                            }
                                                                            /* components */
                                                                            case 'component':
                                                                            {
                                                                                return(
                                                                                    typeof input.component === 'function'
                                                                                    ?
                                                                                    <React.Fragment>
                                                                                        <td></td>
                                                                                        <td>{input.component()}</td>
                                                                                    </React.Fragment>
                                                                                    : null
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
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    :
                                    section.inputs.map((rows,keyRow) => {
                                        return(
                                            <div key={'row-'+keyRow} className='row' style={{marginBottom:0}}>
                                                {
                                                    rows.row.map((input,keyInput) => {
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
                                                                                <InputText id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} alphanumeric={input.alphanumeric} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                            );
                                                                        }
                                                                        case 'text-area':
                                                                        {
                                                                            return(
                                                                                <InputTextArea id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} lowercase={input.lowercase} characters={input.characters} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                            );
                                                                        }
                                                                        case 'number':
                                                                        {
                                                                            return(
                                                                                <InputNumber id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} min={input.min} max={input.max} decimal={input.decimal} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                            );
                                                                        } 
                                                                        case 'email':
                                                                        {
                                                                            return(
                                                                                <InputMail id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} uppercase={input.uppercase} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                            );
                                                                        }
                                                                        case 'phone':
                                                                        {
                                                                            return(
                                                                                <InputPhone id={this.props.id+'-'+input.name} sizeRegion={input.sizeRegion} sizeArea={input.sizeArea} sizeNumber={input.sizeNumber} sizeExtension={input.sizeExtension} icon={input.icon} name={input.name} labelRegion={input.labelRegion} labelArea={input.labelArea} labelNumber={input.labelNumber} labelExtension={input.labelExtension} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} region={input.region} area={input.area} extension={input.extension} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                            );
                                                                        }
                                                                        case 'date':
                                                                        {
                                                                            return(
                                                                                <Datepicker selected={input.selected} name={input.name} formatTime={input.formatTime} defaultTime={input.defaultTime} time={input.time} defaultValue={this.state.data[input.name]} viewLabel={input.viewLabel} onChange={input.onChange} calculateDays={input.calculateDays} min={input.min} placeholder={input.placeholder} colTime={input.colTime} colDate={input.colDate} required={input.required} disabled={input.disabled} labelDate={input.labelDate} labelTime={input.labelTime} nights={input.nights} colNight={input.colNight}/>
                                                                            );
                                                                        }
                                                                        case 'select':
                                                                        {
                                                                            return(
                                                                                <InputSelect id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} multiple={input.multiple} options={input.options} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} autocomplete={input.autocomplete} uppercase={input.uppercase} lowercase={input.lowercase} capitalize={input.capitalize} joinOn={input.joinOn} onChange={input.onChange} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>        
                                                                            );
                                                                        }
                                                                        case 'quantity':
                                                                        {
                                                                            return(
                                                                                <InputQuantity id={this.props.id+'-'+input.name} size={input.size} icon={input.icon} name={input.name} label={input.label} inline={input.inline} placeholder={input.placeholder} defaultValue={this.state.data[input.name]} required={input.required} disabled={input.disabled} hidden={input.hidden} onChange={(input) => {this.changeInputChild(input);input.onChange}} onFocus={input.onFocus} onBlur={input.onBlur} onKeyPress={input.onKeyPress}/>
                                                                            )
                                                                        }
                                                                        case 'checkbox':
                                                                        {
                                                                            return(
                                                                                <InputCheckBox id={this.props.id+'-'+input.name} size={input.size} name={input.name} label={input.label} onChange={input.onChange} checkboxs={input.checkboxs} defaultValues={this.state.data[input.name]}/>
                                                                            );
                                                                        }
                                                                        case 'radio':
                                                                        {
                                                                            return(
                                                                                <InputRadio id={this.props.id + '-' + input.name} size={input.size} name={input.name} label={input.label} onChange={input.onChange} radios={input.radios} defaultValue={this.state.data[input.name]}/>
                                                                            );
                                                                        }
                                                                        case 'switch':
                                                                        {
                                                                            return(
                                                                                <InputSwitch id={this.props.id+'-'+input.name} name={input.name} size={input.size} label1={input.label1} label2={input.label2} color1={input.colo1} color2={input.color2} onChange={(input) => {this.changeInputChild(input);input.onChange}} hidden={input.hidden} required={input.required} disabled={input.disabled}/>
                                                                            );
                                                                        }
                                                                        /* buttons */
                                                                        case 'button':
                                                                        {
                                                                            return(
                                                                                <Button id={this.props.id+'-'+input.label} size={input.size} icon={input.icon} label={input.label} fullSize={input.fullSize} onClick={input.onClick} hidden={input.hidden} disabled={input.disabled} loading={input.loading}/>
                                                                            );
                                                                        }
                                                                        /* components */
                                                                        case 'component':
                                                                        {
                                                                            return(
                                                                                typeof input.component === 'function'
                                                                                ?
                                                                                input.component()
                                                                                : null
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
                                                        )
                                                    })
                                                }
                                            </div>
                                        );
                                    })
                                }
                                </div>
                            </div>
                        );
                    })
                }     
                {
                    this.state.btnDropdowns
                    ?
                    this.state.btnDropdowns.map((btnDropdown,keyBtnDropdown) => {
                        return(
                            <ButtonDropdown key={'button-dropdown-'+keyBtnDropdown} size={btnDropdown.size} id={btnDropdown.id} offset={btnDropdown.offset} icon={btnDropdown.icon} label={btnDropdown.label} color={btnDropdown.color} btnItems={btnDropdown.btnItems} disabled={btnDropdown.disabled} hidden={btnDropdown.hidden}/>
                        );
                    })
                    : null
                }
                {
                    this.state.btnAdditionals != undefined
                    ?
                    this.state.btnAdditionals.map((btnAdd,keyBtnAdd) => {
                        return(
                            <Button key={'button-additional-'+keyBtnAdd} size={btnAdd.size} id={btnAdd.id} icon={btnAdd.icon} label={btnAdd.label} color={btnAdd.color} fullSize={btnAdd.fullSize} onClick={btnAdd.onClick} hidden={btnAdd.hidden} disabled={btnAdd.disabled} loading={btnAdd.loading}/>
                        );
                    })
                    : null
                } 
            </form>
        );
    };
};

Form.propTypes = {
    id : PropTypes.string,
    forms : PropTypes.array,
    data : PropTypes.object,
    btnAdditionals : PropTypes.array,
    btnDropdowns : PropTypes.array,
    disabled : PropTypes.bool,
};

Form.defaultProps = {
    id : uniqueID(),
    forms : [],
    data : {},
    btnAdditionals : [],
    btnDropdowns : [],
    disabled : false,
};