import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

export const clusterCreation = functions.firestore
  .document('sensates/{id}')
  .onCreate(event => {

    console.log(event.params.id);

    return new Promise((resolve, reject) =>{
        const sensate = event.data.data();
        console.log('sensateData',sensate);

        const sensatesDoB = sensate.dateTimeOfBirth;
        /*const sensatesLanguages = sensate.languagesSpoken;
        const sensatesHobbies = sensate.hobbies;
        const sensatesInterests = sensate.interests;
        const sensatesSkills = sensate.skills;
        const sensatesShowsCharacter = sensate.showsCharacter;*/

        const clustersRef = db.collection('clusters');
        const clusters = clustersRef.where('type','==','birthdate')
            .where('typeData', '==', sensatesDoB);
        
        clusters.get().then((clustersFiltered) => {

            if(clustersFiltered){
                //add sensate to clusters
                 clustersFiltered.forEach((cluster:any) => {
                    const clusterType = cluster.data().type;
                    
                    const sensates = cluster.sensates;
                    sensates[sensate.uid] = true;

                    switch (clusterType){
                        case 'birthdate':
                            clustersRef.doc(cluster.id).update(sensates).then((sensateAddedResponse:any)=>{
                                console.log('Added to birthdate cluster')
                            }).catch((err)=>{
                                console.log(err);
                            });
                            break;
                    }

                    resolve('Ok, sensate added');

                });
            }else{
                //add clusters
                const sensates = {};
                sensates[sensate.uid] = true;
                const newClusterType = {
                    id: new Date().getTime(),
                    name: '',
                    type: 'birthdate',
                    typeData: sensatesDoB,
                    sensates: sensates,
                    posts: {},
                    creation: new Date()
                };

                clustersRef.add(newClusterType).then((responseAdd)=>{
                    resolve('Cluster created');
                }).catch((err)=>{
                    reject(err);
                })
            }

        }).catch((err)=>{
            reject(err);
        });

    });

});