# Sample OPC Instance Data Collector
This is a NodeJS **sample** application that will collect some instance information for your OPC instances.

This application will
- Drop all endpoint responses into JSON files in the /output folder
- Drop a CSV file into the /output folder that contains the following information per instance
    - Instance Name
    - State
    - Private IP
    - OCPU
    - Memory
    - Volume Count
    - Volume Size

### Running the application
- Install NodeJS: https://nodejs.org/en/download/
- Rename the .env.defaults file to .env
- Open the .env file
  - Set API_URL to the correct OPC endpoint
  - Set SERVICE_INSTANCE_ID to your Service Instance ID or Identity Domain Name
    - Reference API Authentication here https://docs.oracle.com/en/cloud/iaas/compute-iaas-cloud/stcsa/Authentication.html

#### Auto Run
If you're on Windows, you can just double click _run.bat in the root directory.

#### Manual Run
```
npm install
npm start
```

### License
MIT License

Copyright (c) 2019 Ira Mellor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.