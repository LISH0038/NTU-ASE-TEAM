import React, { Component } from "react";
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import Popup from 'reactjs-popup';
import { Input } from "reactstrap"


class Table extends Component {
  constructor(props) {
    super(props)
    this.password = "1234";
    this.state = {
      students: [],
      disable: true,
      editFlag:[],
      open:false,
      inputPwd:null,
      success:false,
    }
  }

  componentDidMount() {
    require('axios')({
      method:'get',
      url:     'http://localhost:3000/report/'+this.props.sessionId,
    }).then(function (response) {
      console.log('statusCode:', response && response.statusCode);
      this.setState({students:JSON.parse(response).students});
    })
    .catch(function (error) {
      console.log(error);
    });

    // let mockRes = {
    //   index:10001,
    //   sessionId:"1",
    //   students: [
    //   { id: "U1721882B", name: 'Rajasekara Pandian Akshaya Muthu', attendance: 'LATE', email: 'simonel@e.ntu.edu.com' },
    //   { id: "N1902163K", name: 'Simon El Nahas Christensen', attendance: 'ABSENT', email: 'shan004@e.ntu.edu.com' },
    //   { id: "U1721642E", name: 'MN Shaanmugam', attendance: 'ABSENT', email: 'caothai@e.ntu.edu.com' },
    //   { id: "U1620058E", name: 'Harry Cao', attendance: 'ABSENT', email: 'queenofnorth@gmail.com' },
    //   { id: "U1620575J", name: 'Zeng Jinpo', attendance: 'PRESENT', email: 'zjp008@e.ntu.edu.com' },
    //   { id: "U1622186B", name: 'Li Shanlan', attendance: 'PRESENT', email: 'melodyli710@gmail.com' }
    // ]}

    //this.setState({students:mockRes.students});
  }

  toggleEditMode = () =>{
    this.setState({ open: true});
  }

  renderSuccess() {
    if(this.state.success){
      return <h3>Successfully Saved!</h3>
    }
  }


  saveStatusChange = () =>{
    let data = this.state.editFlag.map((index)=>{
      let s = this.state.students[index];
      return {studentId:s.id, attendance: s.attendance};
    });
    console.log(data)
    require('axios')({
      method:'patch',
      url:     'http://localhost:3000/report/'+this.props.sessionId,
      data:   data 
    }).then(function (response) {
      console.log('statusCode:', response && response.statusCode);
    })
    .catch(function (error) {
      console.log(error);
    });

    this.setState({disable:!this.state.disable, success:true});
    console.log(this.state.disable);
  }

  _onSelect(value, index) {
    console.log(value,index);
    let newState = this.state;
    newState.students[index].attendance = value;
    if (!newState.editFlag.includes(index)){
      newState.editFlag.push(index);
    }
    this.setState(newState);
  }

  checkPassword =() =>{
    if (this.state.inputPwd === this.password){
      this.setState({disable:!this.state.disable});
      console.log(this.state.disable);
      this.setState({ open: false});
    }
  }

  closeModal =() =>{
    this.setState({ open: false});
  }

  onInputPwd = (event)=> {
    this.setState({inputPwd: event.target.value});
  };

  renderTableData() {
    const options = [
      'PRESENT', 'LATE', 'ABSENT','EXEMPTED'
    ];
    return this.state.students.map((student, index) => {
      const { id, name, attendance, email } = student //destructuring
      return (
        <tr key={id}>
          <td>{id}</td>
          <td>{name}</td>
          <td><Dropdown disabled={this.state.disable} options={options} onChange={(e) => this._onSelect(e.value, index)} value={this.state.students[index].attendance.toUpperCase()} placeholder="Select an option" /></td>
          <td>{email}</td>
        </tr>
      )
    })
  }

  renderTableHeader() {
    let header = ["Id","Name","Attendance", "Email"];
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>
    })
  }

  render() {
    return (
      // <div style={{
      //   position: 'absolute', left: '12%', top: '12%',background: "lightblue"
      // }}>
      <div>
        <h1 id='title'>Summary Report</h1>
        <table id='students'>
          <tbody>
            <tr>{this.renderTableHeader()}</tr>
            {this.renderTableData()}
          </tbody>
        </table>
        <Popup 
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}>
        <br></br>
        <div>
          <h3>{"Input password to proceed:"}</h3>
          <Input placeholder="password..." style={{ fontSize: '23px' }} onChange={this.onInputPwd}/>
          <button onClick={this.checkPassword} className=" btn-lg  btn-block " style={{
            background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white"
          }} >Submit</button>
        </div>
        
        </Popup>
        <button onClick={this.toggleEditMode} className=" btn-lg  btn-block " style={{
          background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white", margin: "10px 10px", width:"15%", display:"inline-block"
        }} >Edit</button>
        <button onClick={this.saveStatusChange} className=" btn-lg  btn-block " style={{
          background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white", margin: "10px 10px",width:"15%", display:"inline-block"
        }} >Save</button>
        <button onClick={this.props.backFunction} className=" btn-lg  btn-block " style={{
          background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white", margin: "10px 10px",width:"15%", display:"inline-block"
        }} >Back</button>
        {this.renderSuccess()}
      </div>
    )
  }
}

export default Table
