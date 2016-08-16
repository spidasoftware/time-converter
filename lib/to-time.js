module.exports  = function(lineArray){
    var line = "";
    //Employee number is the first 6 characters
    line += ("      " + lineArray[0]).slice(-6);
    //The fields we do not use and are the next 44 characters
    line += new Array(45).join( " " );
    line += lineArray[1]; //D or E
    line += ("  " + lineArray[2]).slice(-2); //Earn Code
    line += new Array(10).join( " " ); // Rate
    line += ("        " + Number(lineArray[3]).toFixed(2)).slice(-8); //Hours
    line += new Array(13).join( " " ); // Next 5 date fields
    line += ("        " + lineArray[4]).slice(-9); //Amount
    return line;
}
