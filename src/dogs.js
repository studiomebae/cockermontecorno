// Fictional demonstration profiles, requested by the owner. Replace with verified
// records and real photographs before presenting these as the breeder's dogs.
export const coats = {
 golden: {it:'Fulvo',en:'Golden'},
 orangeWhite: {it:'Bianco arancio',en:'Orange & white'},
 black: {it:'Nero',en:'Black'},
 orangeRoan: {it:'Bianco arancio roano',en:'Orange roan'},
};
export const dogs = [
 {name:'Miele',coat:'golden',born:2021},
 {name:'Olimpia',coat:'orangeWhite',born:2020},
 {name:'Bruno',coat:'black',born:2019},
 {name:'Nora',coat:'orangeRoan',born:2022},
 {name:'Arturo',coat:'golden',born:2020},
 {name:'Bianca',coat:'orangeWhite',born:2023},
 {name:'Otto',coat:'black',born:2021},
 {name:'Adele',coat:'golden',born:2022},
 {name:'Teo',coat:'orangeRoan',born:2018},
 {name:'Livia',coat:'orangeWhite',born:2024},
].map((dog,index)=>({...dog,pedigree:true,tests:true,illustrative:true,portrait:index}));
