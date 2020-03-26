/*!
 * Folder Cleanup (v1.0.1.20171117), http://tpkn.me/
 * MIT License
 * 
 * Copyright (c) 2017, tpkn.me
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require('fs-extra');
const path = require('path');
const stringToMs = require('string-to-ms');

module.exports = (folder, max_age) => {
   let end_time, diff_time;
   let current_time = Date.now();

   fs.readdir(folder, (err, files) => {
      if(err) return console.error(`[ CLN ] Error: ${err.message}`);

      for(let i = 0, len = files.length; i < len; i++){
         fs.lstat(path.join(folder, files[i]), (err, stat) => {
            if(err) return console.error(`[ CLN ] Error: ${err.message}`);

            end_time = stat.ctime.getTime() + stringToMs(max_age);
            
            if(end_time < current_time){
               fs.remove(path.join(folder, files[i]), err => {
                  if(err) return console.error(`[ CLN ] Error: ${err.message}`);
                  
                  console.info(`[ CLN ] Deleted: ${files[i]}`);
               });
            }
         });
      }
   });
}
