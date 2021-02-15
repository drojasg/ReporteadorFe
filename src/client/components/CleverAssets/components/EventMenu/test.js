import React from 'react';
import SubMenuCollapsed from '../subMenuCollapsed';
import CardCustomizable from '../cardCustomizable';
import './style.css';
export default class Test extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            btnOpenSubmenu: 'btn-show-submenu',
            classSizeMenu: {
                initial: 'col s12 m12 l2 xl2',
                closed: 'hiddenSubMenu',
                selected: 'initial'
            },
            classSizeContentMenu: {
                initial: 'col s12 m12 l10 xl10',
                closed: 'col s12 m12 l12 xl12',
                selected: 'initial'
            },
            hiddenScroll: '',
            dataContent: [],
        };
        this.onCloseMenu = this.onCloseMenu.bind(this);
        this.myRefs = [];
    }

    onCloseMenu(close = true) {
        let classSizeMenu = this.state.classSizeMenu;
        let classSizeContentMenu = this.state.classSizeContentMenu;
        let btnOpenSubmenu = this.state.btnOpenSubmenu;
        let hiddenScroll = this.state.hiddenScroll;

        if (close) {
            classSizeMenu.selected = 'closed';
            classSizeContentMenu.selected = 'closed';
            btnOpenSubmenu = '';
            hiddenScroll = '';

        } else {
            classSizeMenu.selected = 'initial';
            classSizeContentMenu.selected = 'initial';
            btnOpenSubmenu = 'btn-show-submenu';
            hiddenScroll = ' clv-hidden-scroll';
        }
        this.setState({
            classSizeMenu: classSizeMenu,
            classSizeContentMenu: classSizeContentMenu,
            btnOpenSubmenu: btnOpenSubmenu,
            hiddenScroll: hiddenScroll
        });
    }

    miFuncion(index) {
        const comp = this.myRefs[index];
        comp.showReveal();
    }

    render() {
        const revealContent = () => {
            return (
                <div className='col s12 m6 l6 xl6'>
                    <a href="#!" className="secondary-content left" onClick={() => { this.refCardPrincipal.showReveal(false) }}
                    ><i className="material-icons black-text">arrow_back</i>Back</a>
                </div>
            )
        }
        const cardTitle = () => {
            return (<div className='clv-card-title'>
                <h5>Titulo card</h5>
            </div>);
        }
        const menu_data = [
            {
                "title": "Titulo 1",
                "subtitle": [
                    {
                        "subtitleText": "Sub titulo1",
                    },
                    {
                        "subtitleText": "Sub titulo 2",
                    }
                ]
            },
            {
                "title": "Titulo 2",
                "subtitle": [
                    {
                        "subtitleText": "Sub titulo 2",
                    }
                ]
            },
            {
                "title": "Titulo 3",
                "subtitle": [
                    {
                        "subtitleText": "Sub titulo 3",

                    }
                ]
            },
            {
                "title": "Titulo 4",
                "subtitle": [
                    {
                        "subtitleText": "Sub titulo 4",

                    }
                ]
            },
            {
                "title": "Titulo 5",
                "subtitle": [
                    {
                        "subtitleText": "Sub titulo 4",

                    }
                ]
            },
            {
                "title": "Titulo 6",
                "subtitle": [
                    {
                        "subtitleText": "Sub titulo 4",

                    }
                ]
            },
            {
                "title": "Titulo 7",
                "subtitle": [
                    {
                        "subtitleText": "Sub titulo 7",

                    }
                ]
            },
            {
                "title": "Titulo 8",
                "subtitle": [
                    {
                        "subtitleText": "Sub titulo 8",

                    }
                ]
            }
        ];
        let classSizeMenu = this.state.classSizeMenu;
        let classSizeContentMenu = this.state.classSizeContentMenu;
        let hiddenScroll = this.state.hiddenScroll;
        let dataContent = this.state.dataContent;
        return (
            <div className='row clv-submenu-component'>
                <div className={classSizeMenu[classSizeMenu.selected]}>
                    <SubMenuCollapsed onRef={ref => this.refSubMenu = ref}
                        data={menu_data}
                        onCloseMenu={this.onCloseMenu}
                        >
                        {
                            menu_data.map((menuItem, i) => {
                                return (
                                    <div className='clv-submenu-group' key={i}>
                                        <li className='clv-list-title'>
                                            <i className="material-icons black-text">menu</i>
                                            {menuItem.title}
                                        </li>
                                        {
                                            menuItem.subtitle.map((subtitleItem, j) => {
                                                let itemRef = 'item_ref' + i + j;
                                                return (
                                                    <React.Fragment key={i + j}>
                                                        <li ref={itemRef} className='clv-ul-collection-li' onClick={() => {
                                                            this.refCardPrincipal.showReveal(false);
                                                            //this.activeOnSelectItem(itemRef);
                                                            //this.refCardPrincipal.showReveal();
                                                            this.setState({ dataContent: menuItem.subtitle });
                                                        }}>
                                                            <a className='clv-ul-collection-a'>
                                                                {subtitleItem.subtitleText}
                                                            </a>
                                                        </li>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                        }</SubMenuCollapsed>
                </div>
                <div className={/* 'clv-submenu-content ' + */ classSizeContentMenu[classSizeContentMenu.selected] + hiddenScroll}>
                    <CardCustomizable onRef={ref => this.refCardPrincipal = ref}
                        revealContent={revealContent()}
                        cardTitle={cardTitle()}
                        contentClass='clv-card-higth'
                    >
                        <a href="#!"
                            className={"btn-floating waves-effect waves-light white left " + this.state.btnOpenSubmenu}
                            onClick={() => {
                                this.refSubMenu.showOrHideMenu(true);
                                this.onCloseMenu(false);
                            }}>
                            <i className="material-icons black-text">low_priority</i>
                        </a>
                        <div className='row'>
                            {
                                dataContent.map((value, key) => {
                                    return (
                                        <div key={key} className='col s12 m4 l4 xl4'>
                                            <CardCustomizable onRef={ref => this.myRefs.push(ref)}>
                                                <div className="card-content">
                                                    <span className="card-title">{value.subtitleText}</span>
                                                    <p>I am a very simple card. I am good at containing small bits of information.I am convenient because I require little markup to use effectively.</p>
                                                </div>
                                                <div className="card-action">
                                                    <a href="#" 
                                                    onClick={() => { 
                                                        this.refCardPrincipal.showReveal();
                                                        //this.miFuncion(key) }
                                                    }
                                                        }>This is a link</a>
                                                    <a href="#">This is a link</a>
                                                </div>
                                            </CardCustomizable>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </CardCustomizable>
                </div>
            </div>);
    }
}