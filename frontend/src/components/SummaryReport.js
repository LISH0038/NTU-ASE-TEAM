import React, { Component } from "react";




class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      students: [
        { id: 1272677, name: 'Simon El Nahas', attendance: 'PRESENT', email: 'simonel@e.ntu.edu.com' },
        { id: 1627351, name: 'Li Shanlan', attendance: 'LATE', email: 'shan004@e.ntu.edu.com' },
        { id: 1872636, name: 'Cao Ngoc Thi', attendance: 'ABSENT', email: 'caothai@e.ntu.edu.com' },
        { id: 123456, name: 'Sophie Turner', attendance: 'ABSENT', email: 'queenofnorth@gmail.com' }
      ]
    }
  }

  render() { //Whenever our class runs, render method will be called automatically, it may have already defined in the constructor behind the scene.
    return (
      <div>
        <h1>Summary Report</h1>
      </div>
    )
  }

  renderTableData() {
    return this.state.students.map((student, index) => {
      const { id, name, attendance, email } = student //destructuring
      return (
        <tr key={id}>
          <td>{id}</td>
          <td>{name}</td>
          <td>{attendance}</td>
          <td>{email}</td>
        </tr>
      )
    })
  }

  render() {
    return (
      <div>
        <h1 id='title'>Summary Report</h1>
        <table id='students'>
          <tbody>
            {this.renderTableData()}
          </tbody>
        </table>
      </div>
    )
  }

  renderTableHeader() {
    let header = Object.keys(this.state.students[0])
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>
    })
  }

  render() {
    return (
      <div style={{
        position: 'absolute', left: '12%', top: '12%'
      }}>
        <h1 id='title'>Summary Report</h1>
        <table id='students'>
          <tbody>
            <tr>{this.renderTableHeader()}</tr>
            {this.renderTableData()}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Table
