
# <img src="./resources/executioner.jpg" height="300px"/>Larry The Executioner 

<a href="https://www.npmjs.com/org/monstermakes/larry-executioner"><img alt="larry_scaffolds" src="https://nodei.co/npm/larry-executioner.png"/></a>

## Description
This project aims at creating a nodejs libray that can execute arbitrary functions/methods as a set of instructions for automating or testing purposes.

## Example Usage
```javascript
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
                '$cmd:0->request[2]',
                2,
                '$cmd:0->request[0]'
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
```
This is an example of using the Execution class directly. It demonstrates setting up 2 commands to run seuentially where the request arguments being passed into the second command are based on the first. 

These request arguments can be any javascript value however if they are a string that matches the lookup selector format `$command:<cmdId>-><dot selector>` they will be replaced with their "looked up" value. The values are looked up against previously executed command. Each command has a unique cmdId if supplied or are identified by their index in the initial instructionSet. When a command is executed an “Execution Details” object is created that has a bunch of properties in it like `request`,`response`, `failure` etc… The dot selector (a lodash style selctor obj.property[1]) is then used against the Execution Details object to pull the appropriate value. 

So think of the `$cmd:` as a token to tell the executioner to lookup a cmd value, followed by a way to uniquely id the command (id or index). Everything to the right of the `->` is a dot selector to lookup your value in that commands Execution Details object.

Here are a few more examples of request arguments:
```javascript 
$cmd:0->request[0]',
'$cmd:initial->request[0]',
'$cmd:0->request[2].property',
'$cmd:0->request[3][1]',
'$cmd:0->response.someProp',
'$cmd:0->failure.message'
```

## TODO
1. Make it work...
2. Execute Things...
3. Be Rad