### Component : CleverForm
#### Description : Elemento contenedor de tipo formulario.

#### Props
<b>id</b> : <code>string</code>
</br>
<b>forms</b> : <code>array</code> 
</br>
<b>data</b> : <code>object</code>
</br>
<b>btnAdditionals</b> <code>array</code>

#### getData()
Al agregar una referencia al formulario se puede acceder a esta funcion la cual devuelve un arreglo con los valores seleccionados o ingresados en el formulario, junto con este se devuelve un parametro con el numero de errores que se detectaron en el formulario.

#### Implementacion
```JSX
import { CleverForm } from 'clever-component-library';

render()
{
    return(
        <div className='row'>
            <CleverForm
                id={'form-test'}
                forms={[
                    { 
                        inputs:[
                            {row:[
                                {type:'text',size:'col s12 m3 l3',name:'name',label:'Name'},
                                {type:'text-area',size:'col s12 m6 l6',name:'address',label:'Address'},
                                {type:'email',size:'col s12 m3 l3',name:'mail',label:'Email'},
                            ]},
                            {row:[
                                {type:'number',size:'col s12 m3 l3',name:'kids',label:'Kids'},
                                {type:'phone',size:'col s12 m3 l3',name:'phone',label:'Phone'},
                                {type:'quantity',size:'col s12 m3 l3',name:'amount',label:'Amount'},
                                {type:'select',size:'col s12 m3 l3',name:'hotel',label:'Property',
                                    options:[
                                        {value:'ZHSP',option:'sun palace'},
                                        {value:'ZMGR',option:'the grand at mooon palace'},
                                        {value:'ZMNI',option:'moon palace cancun nizuc'},
                                        {value:'ZMSU',option:'moon palace cancun sunrise'},
                                        {value:'ZHBP',option:'beach palace'},
                                    ]
                                },
                            ]},
                            {row:[
                                {type:'radio',size:'col s12 m3 l3',label:'Select Gender',name:'gender',
                                    radios:[{value:1,label:'female'},{value:2,label:'male'}]
                                },
                                {type:'checkbox',size:'col s12 m3 l3',label:'Select Services',name:'services',
                                    checkboxs:[{value:1,label:'gym'},{value:2,label:'spa'},{value:3,label:'buffet'}]
                                },
                            ]},
                        ],
                    }, 
                ]}
                data={{
                    name:'jennifer',
                    address:'c. chacmol int.23',
                    mail:'test@test.com',
                    kids:'2',
                    phone:'998 123 1234',
                    amount:'12999.55',
                    hotel:'ZMSU',
                    gender:'1',
                    services:['1','3'],
                }}
            />
        </div>
    );
};
```

![image](https://user-images.githubusercontent.com/26228552/69430702-347f2700-0d04-11ea-94ad-8ac3123e0712.png)
