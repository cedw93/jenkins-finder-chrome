# Jenkins Param finder

This is a very simple-hackishly written chrome extension which lets you specify a job name and 
certain criteria and return a list of jobs which match your criteria.

## TODO:

* Error handling
* Nice(r) UI
* Limits
* Date range
* 


## Usage

Simply open the extension when on one of your jenkins webpages. If this page is a job page it will
prepopulate the job name for you but you can change this to any jenkins job on the same domain.

Once you have specified the job name, you need some criteria to match it against...


### Criteria (Params)

The critera is a comma seperated string of the following format

```
PARAM=VALUE=regex|exact,PARAM=VALUE=regex|exact,PARAM=VALUE=regex|exact,...
```

Where

* `PARAM` is the name job paramater you will be matching against (case sensitive)
* `VALUE` is the value of the `PARAM` you will be matching against
* `regex|exact` is the type of match to perform... (optional)
	* a `regex` match will perform a regex match using `VALUE` as the regex
	* an `exact` match will perform a case senstive match using `VALUE`'s case for the matching
	* This is optional, if this is left off (dont include the second `=` if you leave this off) or something other than
	  `regex` or `exact` is supplied it will default to a case insensitive string match.

**NOTE** : If you specify `X` number of criteria, the returned jobs will only be returned if all the criteia matches.

### Example.

If I wanted to find every instance of `example.job` that ran using the parameters `ENV: Test`, `USER: Tester` and `COLOR: Green` I could do the following:

```
Jobname: example.job
Params: ENV=Test=exact,USER=Tester=exact,COLOR=Green=exact
````
or if The case doesn't matter...

```
Jobname: example.job
Params: ENV=Test,USER=Tester,COLOR=Green
````

or if You're not sure on the exact value of `COLOR`

```
Jobname: example.job
Params: ENV=Test=exact,USER=Tester=exact,COLOR=.*=regex
````