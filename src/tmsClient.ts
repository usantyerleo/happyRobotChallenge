import net from 'net';
import dotenv from 'dotenv';

dotenv.config();

export const searchLoadsInTMS = async (origin: string, destination: string, equipmentType: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        const host = process.env.TMS_HOST || 'tramway.proxy.rlwy.net';
        const port = Number(process.env.TMS_PORT) || 17159;
        const token = process.env.TMS_TOKEN;

        let responseData = '';

        client.setTimeout(15000);

        client.connect(port, host, () => {
            console.log('Conectado ao TMS Legado. Montando requisição LOAD_QUERY...');
            
            let requestString = `CMD:LOAD_QUERY|AUTH:${token}`;
            
            if (origin) {
                const cleanOrigin = origin.trim();
                if (cleanOrigin.length === 2) {
                    requestString += `|ORIG_STATE:${cleanOrigin.toUpperCase()}`;
                } else {
                    const city = cleanOrigin.split(',')[0].trim();
                    requestString += `|ORIG_CITY:${city}`;
                }
            }
            
            if (destination) {
                const cleanDest = destination.trim();
                if (cleanDest.length === 2) {
                    requestString += `|DEST_STATE:${cleanDest.toUpperCase()}`;
                } else {
                    const destCity = cleanDest.split(',')[0].trim();
                    requestString += `|DEST_CITY:${destCity}`;
                }
            }
            
            if (equipmentType) {
                const eqType = equipmentType.toUpperCase().replace(/ /g, '_');
                requestString += `|EQTYPE:${eqType}`; 
            }
            
            requestString += `|MAX_RESULTS:10\r\n`;

            console.log("➡️ STRING EXATA ENVIADA AO TMS:");
            console.log(requestString.trim());
            
            client.write(requestString, 'ascii');
        });

        client.on('data', (data) => {
            responseData += data.toString('ascii');
            
            if (responseData.includes('END\r\n') || responseData.startsWith('ERR|')) {
                client.destroy(); 
            }
        });

        client.on('close', () => {
            try {
                if (responseData.startsWith('ERR|')) {
                    return reject(new Error(`Erro reportado pelo TMS: ${responseData.trim()}`));
                }

                const lines = responseData.split('\r\n').filter(line => line && line !== 'END');
                
                const loads = lines.map(line => {
                    const loadObj: any = {};
                    const pairs = line.split('|');
                    
                    pairs.forEach(pair => {
                        if (pair) {
                            const [key, value] = pair.split(':');
                            if (key && value) {
                                loadObj[key.trim().toLowerCase()] = value.trim(); 
                            }
                        }
                    });
                    return loadObj;
                });

                resolve({ status: 'success', total: loads.length, loads });
            } catch (error) {
                reject(new Error('Falha ao interpretar os dados retornados pelo TMS.'));
            }
        });

        client.on('error', (err) => {
            reject(new Error(`Erro no socket TCP: ${err.message}`));
        });

        client.on('timeout', () => {
            client.destroy();
            reject(new Error('Timeout: O TMS demorou muito para responder.'));
        });
    });
};