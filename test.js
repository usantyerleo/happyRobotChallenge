async function runTests() {
    console.log("🚀 Iniciando testes das APIs...\n");

    try {
        // 1. Testar Busca de Cargas no TMS
        console.log("--- 1. Testando /search-loads ---");
        const searchRes = await fetch('http://localhost:3000/search-loads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin: "GA",
                destination: "TX",
                equipmentType: "dry_van"
            })
        });
        const searchData = await searchRes.json();
        console.log(JSON.stringify(searchData, null, 2));

        // 2. Testar Verificação de Transportadora (FMCSA)
        console.log("\n--- 2. Testando /verify-carrier ---");
        const carrierRes = await fetch('http://localhost:3000/verify-carrier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mcNumber: "MC123456"
            })
        });
        const carrierData = await carrierRes.json();
        console.log(JSON.stringify(carrierData, null, 2));

        // 3. Testar Geração de OTP
        console.log("\n--- 3. Testando /generate-otp ---");
        const otpGenRes = await fetch('http://localhost:3000/generate-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: "+15551234567"
            })
        });
        const otpGenData = await otpGenRes.json();
        console.log(JSON.stringify(otpGenData, null, 2));

        // Pega o código OTP gerado no debug para testar a validação logo em seguida
        const generatedCode = otpGenData.debugOtp;

        if (generatedCode) {
            // 4. Testar Validação de OTP
            console.log(`\n--- 4. Testando /verify-otp com o código: ${generatedCode} ---`);
            const otpValRes = await fetch('http://localhost:3000/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    otp: generatedCode
                })
            });
            const otpValData = await otpValRes.json();
            console.log(JSON.stringify(otpValData, null, 2));
        }

        console.log("\n✨ Todos os testes foram executados com sucesso!");

    } catch (err) {
        console.error("❌ Erro durante os testes:", err);
    }
}

runTests();