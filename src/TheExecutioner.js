'use strict';
const Execution = require('./Execution');

class TheExecutioner{
	constructor(){
		this._executions = [];
	}
	async execute(instructionSet){
		let execution = new Execution(instructionSet);
		this._executions.push(execution);
		let executionDetailsSet = await execution.execute();
		return executionDetailsSet;
	}
}
module.exports=TheExecutioner;