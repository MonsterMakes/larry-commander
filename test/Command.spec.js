'use strict';
const chai = require('chai');
const should = chai.should();
//const expect = chai.expect;

const Command = require("../src/Command");

class Parent{
	method(){
		return {
			property: "value",
			args: [...arguments]
		}
	}
	method2(toBeEchoed){
		return toBeEchoed;
	}
}

const TEST_NAME = 'Test Command';
describe(TEST_NAME, () => {
	it('should execute a single command via method', () => {		
		let p = new Parent();
		let cmdMethod = new Command(this,{
			classInstance: p,
			method: 'method',
			args: [1,2,3]
		});
		return cmdMethod.execute()
			.then((result)=>{
				result.should.eql({
					property: "value",
					args: [1,2,3]
				});
			});
	});
	it('should execute a single command via function', () => {		
		let p = new Parent();
		let cmdMethod = new Command(this,{
			thisContext: p,
			function: p.method,
			args: [1,2,3]
		});
		return cmdMethod.execute()
			.then((result)=>{
				result.should.eql({
					property: "value",
					args: [1,2,3]
				})
			});
	});
});