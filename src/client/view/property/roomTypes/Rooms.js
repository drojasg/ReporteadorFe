import React, { Component } from 'react';
import { CleverForm } from 'clever-component-library';

export default class Rooms extends Component {
   constructor(props) {
       super(props);
       this.handlerAddRoomType = this.handlerAddRoomType.bind(this);
       this.refForm = React.createRef();
       this.state = {
           name_lenguaje: [],
       }
       this.arrayDesciptions = new Array();
   }

    componentDidMount() {
        this.getDescByLanguages();
    }


    handlerAddRoomType(){
        console.log(this.refForm.getData());
    }

    getDescByLanguages = async () => {
        this.props.language.map((item, key) => {
            this.arrayDesciptions.push(
                <label id={key}>Description ({item.language})</label>,
                <textarea id={key} name={'description_'+item.language}></textarea>
            );
        });        
    }
  

    render() {
        return (
            <div className="row">
                <CleverForm
                    id={'form-test'}
                    ref={ref => this.refForm = ref}
                    forms={[
                        { 
                            inputs:[
                                {
                                    row: [
                                        {type:'component', 
                                            component:() =>{                                      
                                                return (
                                                    <dev>
                                                        <div className='col s12 m12 l6'>
                                                            {this.arrayDesciptions}
                                                        </div>
                                                        <div className='col s12 m12 l6'>
                                                            <label>Name</label>
                                                            <input type='text' name ='name' placeholder='Name'></input>
                                                        
                                                            <label>Code room</label>
                                                            <input type='text' name ='code_room' placeholder='Code rooom'></input>
                                                        
                                                            <button type='button' onClick={this.handlerAddRoomType} id="AddRoomType" className='btn' >ADD ROOM TYPE</button>
                                                        </div>
                                                    </dev>
                                                );
                                            }   
                                        },
                                    ]
                                }
                            ],
                        }, 
                    ]}
                />
            </div>
        )
    }
}