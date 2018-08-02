'use strict';
class Command{
	constructor(executionInstance,instruction={}){
		this._executionInstance = executionInstance;
		
		//Use command method for an arbitrary function
		this._commandFunction = instruction.function;
		this._commandFunctionThisContext = instruction.thisContext;
		
		//Or specify a class instance and a method
		this._commandClassInstance = instruction.classInstance;
		this._commandMethod = instruction.method;
		
		this._commandArgs = instruction.args;
		
	}
	_executeCommandMethod(){
		return Promise.resolve()
			.then(()=>{
				return this._commandClassInstance[this._commandMethod]
					.apply(this._commandClassInstance,this._commandArgs);
			});
	}
	_executeCommandFunction(){
		return Promise.resolve()
			.then(()=>{
				let thisContext = this._executionInstance;
				if(this._commandFunctionThisContext){
					thisContext = this._commandFunctionThisContext;
				}
				return this._commandFunction.apply(thisContext,this._commandArgs);
			});
	}
	execute(){
		if(this._commandFunction){
			return this._executeCommandFunction();
		}
		else if(this._commandClassInstance){
			return this._executeCommandMethod();
		}
	}
}
module.exports=Command;