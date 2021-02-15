import React from 'react';
import './styleClvCard.css'
export default class CardCustomizable extends React.Component {
   constructor(props) {
      super(props);
      this.clvCardRef = React.createRef();
      this.containerRef = React.createRef();
      this.clvCardReveal = React.createRef();
      this.state = {
         openedReveal: false
      }
      this.showReveal = this.showReveal.bind(this);
      this.listener = this.listener.bind(this);
   }
   componentDidMount(){
      let e = this.refs.clvCardReveal;
      console.warn("Ref =>",e);
      e.addEventListener("animationend", this.listener, false);
      this.props.onRef(this);
   }

   listener(e){
      let onClose = this.props.transitionTime.onClose;
      onClose = parseFloat(onClose);
      switch(e.type) {
         case "animationstart":
            /**
             * e.addEventListener("animationstart", this.listener, false);
             * en caso de ejecutar evento al iniciar animación
             */
           break;
         case "animationend":
            if(e.elapsedTime == onClose && !this.state.openedReveal){
               this.refs.clvCardReveal.style.display = 'none';
               this.clvCardRef.current.style.overflow ='auto';
            }
           break;
         case "animationiteration":
            /**
             * en caso de ejecutar evento al iterar varias veces la animación
             * e.addEventListener("animationiteration", this.listener, false)
             */
           break;
       }
   }

   /**
    * 
    * @param {boolean} show 
    * metodo utilizado para agregar efecto cuando se abre y cierra el reveal
    */
   showReveal(show = true) {
      let openedReveal = show;
      let onOpen = this.props.transitionTime.onOpen;
      let onClose = this.props.transitionTime.onClose;
      if (show) {
         this.clvCardRef.current.style.overflow ='hidden';
         this.refs.clvCardReveal.current.current.classList.remove('clv-transition-hide');
         this.refs.clvCardReveal.current.classList.add('clv-transition-show');
         this.refs.containerRef.current.classList.add('clv-card-content-hide'); 
         this.refs.clvCardReveal.current.style.display = 'block';
         this.refs.clvCardReveal.current.style.animationDuration = onOpen;
      } else {
         this.refs.clvCardReveal.current.style.animationDuration = onClose;
         this.refs.clvCardReveal.current.containerReflassList.add('clv-transition-hide');
         this.refs.clvCardReveal.current.classList.remove('clv-transition-show');
         this.refs.containerRef.current.classList.remove('clv-card-content-hide'); 
      }
      this.setState({
         openedReveal: openedReveal
      });
      
   }
   

   render() {
      return (
         <div ref={this.clvCardRef} className='clv-card z-depth-1'>
            {this.props.cardTitle}
            <div ref={this.containerRef} className={'clv-card-content '+this.props.contentClass}>
               {this.props.children}
            </div>
            <div ref={this.clvCardReveal} className='clv-reveal-show z-depth-1'>
               {this.props.revealTitle}
               {this.props.revealContent}
            </div>
         </div>
      )
   }
}

CardCustomizable.defaultProps = {
   onRef: (context) => {},
   class: '',
   contentClass:'',
   cardTitle:null,
   revealTitle:null,
   revealContent:null,
   children:null,
   transitionTime:{
      onOpen:'1s',
      onClose:'1s'
   }
};