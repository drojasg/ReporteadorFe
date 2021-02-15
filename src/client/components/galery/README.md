# Component: SelectedGalery

## Description:

You get a **SelectedGalery** in html to **display information** based on the called of an interface and a configuration of the information to be displayed.

## Props:

* > <b>callBack:</b> <code>function(data)</code> **(required)** Event function that returns response of the selected ITEMS **(data) => {}**.

* > <b>label:</b> <code>string</code> Add the name of the button that opens the modal

* > <b>url:</b> <code>string</code> **(required)** Attribute required to obtain the gallery that you can access

* > <b>system:</b> <code>string</code> **(required)** System that you will access to make the GET request.

* > <b>icon:</b> <code>string</code> Attribute that determines which icon you want to display on the initial button. Default ** burst_mode **

## Use Props:

* ### Example create Open Button Basic
```javascript

        import SelectedGalery from 'SelectedGalery';

        <SelectedGalery
            label={'Manager Images'}
            callBack={ (response) => this.saveAsset(response) }
            url={ `/api/property-description/create/all` }
            system={ `bengine` }
            icon={ 'burst_mode' }
        />



    ## Example Response => url:

    response: {
        msg: 'Success',
        Error: false,
        data: [ 
            { 
                "iddef_media_property_desc":217,
                "nombre_archivo":"report_20200113.xlsx",
                "url":"https://s3.amazonaws.com/webfiles_palace/books/pro/images/1984.jpeg",
                "selected":0,
                "tags":[ 
                    "Test",
                    "Preview",
                    "Python"
                ]
            },
            { 
                "iddef_media_property_desc":218,
                "nombre_archivo":"leBlanc.jpeg",
                "url":"https://s3.amazonaws.com/webfiles_palace/books/pro/images/El_Hombre_Que_Fue_Jueves.jpeg",
                "selected":1,
                "tags":[ 
                    "playa",
                    "arena",
                    "leblanc",
                    "vista panoramica"
                ]
            }
        ]
    }