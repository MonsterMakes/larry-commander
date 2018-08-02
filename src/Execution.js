'use strict';
const _ = require("lodash");
const Command = require('./command');

class Execution{
	constructor(instructionSet={}){
		this._currentIndex = 0;
		this._instructionSet = instructionSet;
		this._instructionSetExecutionResults = {};
	}
	_resolveArguments(args=[]){
		let resolvedArgs = [];
		args.forEach(arg => {
			if(_.isString(arg)){
				let matchResults = arg.match(/^\$([^.[]+)(.+)/);
				if(matchResults){
					if(matchResults.length === 3){
						let id = matchResults[1];
						let lookupDetails = matchResults[2];
						if(lookupDetails.startsWith('.')){
							lookupDetails = lookupDetails.slice(1);
						}
						let executionDeets = this._instructionSetExecutionResults[id];
						let value = _.get(executionDeets,lookupDetails,undefined);
						resolvedArgs.push(value);
					}
					else{
						throw new Error('Invalid argument lookup value: '+arg+'. Must use the following syntax $cmd:<commandId or index>-><dot selector>, e.g; $cmd:0->request[3].property');
					}
				}
				else{
					resolvedArgs.push(arg);
				}
			}
			//If its not a string it does not need to be resolved.
			else{
				resolvedArgs.push(arg);
			}
		});
		return resolvedArgs;
	}
	_prepareInstruction(instruction){
		let resolvedArgs = this._resolveArguments(instruction.args);
		let resolvedInstruction = _.merge({},instruction,{args: resolvedArgs});
		let command = new Command(this,resolvedInstruction);
		return {
			command,
			instruction: instruction,
			request: resolvedArgs
		};
	}
	_executeCommand(executionDetails){
		return executionDetails.command.execute();
	}
	async _executeInstruction(instruction,currentIndex){
		let executionDetails = await this._prepareInstruction(instruction);
		//Set the execution details
		if(instruction && instruction.id){
			this._instructionSetExecutionResults[instruction.id] = executionDetails;
		}
		this._instructionSetExecutionResults[currentIndex] = executionDetails;

		try{
			let executionResult = await this._executeCommand(executionDetails);
			executionDetails.response = executionResult;
			return executionDetails;
		}
		catch(executionFailure){
			executionDetails.failure = executionFailure;
			throw executionFailure;
		}
	}
	async _executeInstructionPostHook(execuationDetails,currentIndex){
		if(execuationDetails.instruction.postHook){
			let result = await execuationDetails.instruction.postHook(_.cloneDeep(execuationDetails),currentIndex,this);
			return result;
		}
	}
	async _executeExecutionPostHook(){
		if(this._instructionSet.postHook){
			let result = await this._instructionSet.postHook(this.instructionSetResults,this);
			return result;
		}
	}
	/*********************************************************/
	/* START PUBLIC METHODS */
	/*********************************************************/
	get instructionSet(){
		return _.cloneDeep(this._instructionSet);
	}
	get instructionSetResults(){
		return _.cloneDeep(this._instructionSetExecutionResults);
	}
	async execute(){
		for(const [currentIndex, instruction] of this._instructionSet.commands.entries()){
			this._currentIndex = currentIndex;
			try{
				let execuationDetails = await this._executeInstruction(instruction,currentIndex);
				
				try{
					let postHookResponse = await this._executeInstructionPostHook(execuationDetails,currentIndex);
					execuationDetails.postHookResponse = postHookResponse;
				}
				catch(postHookFailure){
					throw postHookFailure;
				}
			}
			catch(executionFailure){
				throw executionFailure;
			}
		}
		let postHookResponse = await this._executeExecutionPostHook();
		this._instructionSetExecutionResults.postHookResponse = postHookResponse;
		return this._instructionSetExecutionResults;
	}
	/*********************************************************/
	/* END PUBLIC METHODS */
	/*********************************************************/
}
module.exports=Execution;