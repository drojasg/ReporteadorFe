import React from 'react';
import './styleSubmenu.css';

class SubMenuCollapsed extends React.Component {
   constructor(props) {
      super(props);
      this.refSubMenu = React.createRef();
      this.initialClass = 'clv-submenu-show';
      this.state = {
         iconOption: 'chevron_left',
      };

   }
   componentDidMount() {
      this.props.onRef(this);
   }

   /** 
    * @param {boolean} open
    * metodo utilizdo para mostrar y ocultar el submenu
   */
   showOrHideMenu = (open = false) => {
      if (open) {
         this.refs.refNavContainer.style.display = 'block';
      } else {
         this.refs.refNavContainer.style.display = 'none';
         this.props.onCloseMenu();
      }
   }

   /**
    * 
    * @param {ref} ref referensia del item seleccionado
    * metodo encarcago de agregar la clase active al item seleccionado
    */
   activeOnSelectItem(ref) {
      let header = this.refSubMenu.current;
      let list = header.getElementsByTagName('li');
      for (let index = 0; index < list.length; index++) {
         let element = list[index];
         element.classList.remove('active-submenu');
      }
      this.refs[ref].classList.add('active-submenu');
   }

   /**
    * 
    * @param {event} e 
    * El metodo se ejecuta en el onChange del buscador filtra
    * en base al contenido existente en el dom
    */
   filterItem(e) {
      let content = this.refSubMenu.current;
      let value = e.target.value.toUpperCase();
      let list = content.getElementsByClassName('clv-submenu-group');
      for (let index = 0; index < list.length; index++) {
         let element = list[index];
         let txtValue = element.textContent || element.innerText;
         if (txtValue.toUpperCase().indexOf(value) > -1) {
            element.style.display = "";
         } else {
            element.style.display = "none";
         }
      }
   }

   /**
    * @param {event}
   */
   rendeMenuItem = (menu_data = []) => {
      return (
         <ul ref={this.refSubMenu} className='clv-ul-collection clv-display-grid'>
            {
               this.props.children
            }
         </ul>
      );
   }
   render() {
      return (
         <div ref='refNavContainer' className='clv-submenu'>
            <div>
               <a href="#!" className="secondary-content right" onClick={() => { this.showOrHideMenu() }}
               ><i className="material-icons black-text">{this.state.iconOption}</i></a>
            </div>
            <div ref='refNavList' className={this.initialClass}>
               <p style={{ fontSize: '17px' }}><b>Seleccione un item</b></p>
               <input placeholder="Search item" id="first_name" type="text" onChange={(e) => { this.filterItem(e) }} />
               {
                  this.rendeMenuItem(this.props.data)
               }
            </div>
         </div>
      );
   }
}

export default SubMenuCollapsed;