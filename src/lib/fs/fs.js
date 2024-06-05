const fs = require('fs')

class FS {
   constructor (dir){
      this.dir = dir
   }
   read(){
      return fs.readFileSync(this.dir,{encoding: "utf-8",flag: "r"})
   }
   write(data) {
      return fs.writeFileSync(this.dir, JSON.stringify(data, null, 4))
   }
   delete() {
      return fs.unlink(this.dir, function(err) {
         if(err && err.code == 'ENOENT') {
             // file doens't exist
             console.info("File doesn't exist, won't remove it.");
         } else if (err) {
             // other errors, e.g. maybe we don't have enough permission
             console.error("Error occurred while trying to remove file");
         } else {
             console.info(`removed`);
         }
      })
   }
}

module.exports  =  FS;