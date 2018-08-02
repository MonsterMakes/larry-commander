'use strict';
const chai = require('chai');
const should = chai.should();// eslint-disable-line
const expect = chai.expect;

const Command = require('../src/Command');
const Execution = require('../src/Execution');

class Parent{
	method(){
		return {
			property: 'value',
			args: [...arguments]
		};
	}
	method2(toBeEchoed){
		return toBeEchoed;
	}
}

const TEST_NAME = 'Test Execution';
describe(TEST_NAME, () => {
	it('should execute a single instruction', () => {
		let p = new Parent();
		let instructionSet = {
			commands: [
				{
					id: 'initial',
					classInstance: p,
					method: 'method',
					args: [1,2,3]
				},
			]
		};
		let execution = new Execution(instructionSet);
		return execution.execute()
			.then((result)=>{
				result[0].response.should.eql({
					property: 'value',
					args: [1,2,3]
				});
			});
	});
	it('should execute multiple instructions', () => {
		let p = new Parent();
		let instructionSet = {
			commands: [
				{
					id: 'initial',
					classInstance: p,
					method: 'method',
					args: [1,2,3]
				},
				{
					id: 'second',
					classInstance: p,
					method: 'method',
					args: [4,5,6]
				},
			]
		};
		let execution = new Execution(instructionSet);
		return execution.execute()
			.then((result)=>{
				result[0].response.should.eql({
					property: 'value',
					args: [1,2,3]
				});
				result[1].response.should.eql({
					property: 'value',
					args: [4,5,6]
				});
			});
	});
	it('should resolve arguments', async () => {
		let e = new Execution();
		let instruction1 = {
			id: 'initial',
			classInstance: e,
			method: 'method',
			args: [true,42,{property: 'value'},[1,2,3]]
		};
		let executionDetails1 = {
			command: new Command(e,instruction1),
			instruction: instruction1,
			request: [true,42,{property: 'value'},[1,2,3]],
			response: {someProp: 'anotherVal'},
			failure: {message: 'This is a failure'}
		};
		e._instructionSetExecutionResults[0] = executionDetails1;
		e._instructionSetExecutionResults[instruction1.id] = executionDetails1;

		let resolvedArgs = e._resolveArguments([
			'$0.request[0]',
			'$initial.request[0]',
			'$0.request[2].property',
			'$0.request[3][1]',
			{custom: true},
			'$0.response.someProp',
			'$0.failure.message'
		]);
		resolvedArgs.should.eql([
			true,
			true,
			'value',
			2,
			{custom: true},
			'anotherVal',
			'This is a failure'
		]);
	});
	it('should execute multiple instructions with previous results', () => {
		let p = new Parent();
		let instructionSet = {
			commands: [
				{
					id: 'initial',
					classInstance: p,
					method: 'method',
					args: [1,2,3]
				},
				{
					id: 'second',
					classInstance: p,
					method: 'method',
					args: [
						'$0.request[2]',
						2,
						'$0.response.args[0]'
					]
				},
			]
		};
		let execution = new Execution(instructionSet);
		return execution.execute()
			.then((executionDetails)=>{
				executionDetails[0].request.should.eql([1,2,3]);
				executionDetails[1].request.should.eql([3,2,1]);
			});
	});
	it('should fail when a postHook fails', () => {
		let p = new Parent();
		let instructionSet = {
			commands: [
				{
					id: 'initial',
					classInstance: p,
					method: 'method',
					args: [1,2,3],
					postHook: ()=>{
						return Promise.reject();
					}
				},
				{
					id: 'second',
					classInstance: p,
					method: 'method',
					args: [
						'$0.request[2]',
						2,
						'$0.response.args[0]'
					]
				},
			]
		};
		let execution = new Execution(instructionSet);
		return execution.execute()
			.then(()=>{
				return Promise.reject(new Error('execute() should NOT have suceeded.'));
			})
			.catch(()=>{
				expect(execution.second).to.not.exist;
				expect(execution[1]).to.not.exist;
				execution.instructionSetResults[0].request.should.eql([1,2,3]);
				return Promise.resolve();
			});
	});
	it('should instruction set post hooks should run', () => {
		let p = new Parent();
		let postHookShouldHaveRun = false;
		let instructionSet = {
			commands: [
				{
					id: 'initial',
					classInstance: p,
					method: 'method',
					args: [1,2,3]
				},
				{
					id: 'second',
					classInstance: p,
					method: 'method',
					args: [
						'$0.request[2]',
						2,
						'$0.response.args[0]'
					]
				},
			],
			postHook: (instructionSetResults)=>{
				postHookShouldHaveRun = true;
				instructionSetResults[0].request.should.eql([1,2,3]);
				instructionSetResults[1].request.should.eql([3,2,1]);
			}
		};
		let execution = new Execution(instructionSet);
		return execution.execute()
			.then(()=>{
				postHookShouldHaveRun.should.be.true;
			});
	});
});