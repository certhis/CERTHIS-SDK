module.exports = function (Web3) {
  var decodeLogsUntilEventName = function (
    logs,
    abi,
    targetEventName,
    targetParamName
  ) {
    var web3 = new Web3("http://localhost/");
    const contract = new web3.eth.Contract(abi);
    let results = [];


    for (let log of logs) {
      const eventSignature = log.topics[0];
      for (let eventAbi of abi) {
        if (
          eventAbi.type === "event" &&
          web3.eth.abi.encodeEventSignature(eventAbi) === eventSignature
        ) {
          const decodedData = web3.eth.abi.decodeLog(
            eventAbi.inputs,
            log.data,
            log.topics.slice(1)
          );

          if (eventAbi.name === targetEventName) {
            results.push(decodedData[targetParamName].toString());
          }
          break;
        }
      }
    }

    return results.length ? results : null; 
  };

  var multiplyBigIntByFloat = function (bigintValue, floatValue) {
    bigintValue = BigInt(bigintValue);
    // Convertir le float en sa plus petite représentation entière
    const factor = Math.pow(
      10,
      floatValue.toString().split(".")[1]?.length || 0
    ); // Combien de chiffres après la virgule
    const intFromFloat = BigInt(Math.round(floatValue * factor));

    // Multiplier
    const resultInt = bigintValue * intFromFloat;

    // Ajuster le résultat en remettant le point décimal à sa place
    const result = resultInt / BigInt(factor);

    return result;
  };

  return {
    decodeLogsUntilEventName: decodeLogsUntilEventName,
    multiplyBigIntByFloat: multiplyBigIntByFloat,
  };
};
