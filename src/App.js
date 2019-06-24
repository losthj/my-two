import React, { Component,Fragment } from 'react';
import { CSSTransition,TransitionGroup } from 'react-transition-group';
import './style.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state={
      show:true,
      list:[]
    }
    this.handleToggle =this.handleToggle.bind(this);
    this.handleAddItem =this.handleAddItem.bind(this);
  }
  
  render() {
    return (
      <Fragment>
        {/* <div className={this.state.show?'show':'hide'}>hello</div> */}
        {/* <CSSTransition
          in={this.state.show}
          timeout={1000}
          classNames='fade'
          onEntered={(el)=>{el.style.color='blue'}}
          appear ={true}
        >
          <div>hello</div>
        </CSSTransition> 
        <button onClick={this.handleToggle}>toggle</button>
        */}
        <TransitionGroup>
        {
          this.state.list.map((item,index)=>{
            return (
              <CSSTransition
                timeout={1000}
                classNames='fade'
                onEntered={(el)=>{el.style.color='blue'}}
                key={index}
                appear ={true}>
                  <div >{item}</div>
              </CSSTransition>
            )
          })
        }
        </TransitionGroup>
      <div>hello</div>
      <button onClick={this.handleAddItem}>toggle</button>
      </Fragment>
    );
  }
  handleAddItem(){
    this.setState((prevState)=>{
      return{
        list: [...prevState.list,'item']
      }
    })
  }

  handleToggle(){
    //alert("1")
    this.setState({
      show:this.state.show ? false: true
    })
  }
}

export default App;