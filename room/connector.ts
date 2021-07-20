import { types } from "mediasoup"
import { ProducerOptions } from "mediasoup/lib/Producer"

interface Constraints{
	audio: boolean,
	video: boolean
}

const transportOptions = {
	listenIps : [ { ip: "0.0.0.0", announcedIp: process.env.PUBLIC_IP || "192.168.0.100" } ],
	enableUdp : process.env.ENABLE_UDP? (process.env.ENABLE_UDP === 'true'): true,
	enableTcp : process.env.ENABLE_TCP? (process.env.ENABLE_TCP === 'true'): true,
	preferUdp : true
}

class Connector {

  _router: types.Router
  produceTransport: types.WebRtcTransport
  consumeTransports: Map<string, types.WebRtcTransport>
  producers: Map<string, types.Producer>
  consumers: Map<string, Map<string, types.Consumer>>
  constraints: Constraints 

  constructor(router: types.Router){
    this._router = router
    this.consumeTransports = new Map()
    this.producers = new Map()
    this.consumers = new Map()
  }


  //Мы подключаем в транспорт всякие produce и пробрасываем их заодно уж
  async produce(produceOptions: ProducerOptions[], constraints: Constraints){
    this.constraints = constraints
    if(!produceOptions){
      await this._updateConstraints()
      return
    }

    if(!this.produceTransport){
      this.produceTransport = await this._router.createWebRtcTransport(transportOptions)
    }else{
      //Нам нужно пересоздать все producers если мы оставляем транспорт
      for(let producer of this.producers.values())
        producer.close()
      this.producers.clear()
      this.consumers.clear()
    }

    for(let options of produceOptions){
      const producer = await this.produceTransport.produce(options)
      this.producers.set(producer.id, producer)
      this.consumers.set(producer.id, new Map())
    }

    await this._updateConstraints()
  }

  async consumeUser(user_id: string){

    let consumeTransport = this.consumeTransports.get(user_id)

    if(!consumeTransport){
      consumeTransport = await this._router.createWebRtcTransport(transportOptions)
      this.consumeTransports.set(user_id, consumeTransport)
    }else{
      //Это мера, необходимая лишь для того, чтобы WebRTC принимал разные m-lines
      (consumeTransport as any)._nextMidForConsumers = 0
    }

    const consumers: Array<types.Consumer> = []
    
    for(let producer of this.producers.values()){
      
      const consumer = await consumeTransport.consume({
        producerId: producer.id,
        paused: true,
        rtpCapabilities: this._router.rtpCapabilities
      })
      
      // await consumer.enableTraceEvent([ "rtp", "pli" ]);
	 		// consumer.on('trace', trace => console.log(trace.info.sequenceNumber + " packet with payload " + trace.info.payloadType))

      this.consumers.get(producer.id).set(user_id, consumer)
      consumers.push(consumer)
    }
    return consumers
  }

  async removeUser(user_id: string){
    if(this.consumeTransports.get(user_id)){
      this.consumeTransports.get(user_id).close()
      this.consumeTransports.delete(user_id)
    }
    for(let consumers of this.consumers.values())
      consumers.delete(user_id)
  }

  //Получение списка потоков
  getConstraints(): Constraints{
    if(this.constraints) return this.constraints
    const obj = { audio: false, video: false }
    for(let producer of this.producers.values())
      obj[producer.kind] = true
    return obj
  }

  updateConstraints(constraints: Constraints){
    this.constraints = constraints
    this._updateConstraints()
  }
  //Мы подстраиваем продьюсеров под constraints
  async _updateConstraints(){
    if(!this.constraints) return
    for(let producer of this.producers.values()){
      if(this.constraints[producer.kind] === false && !producer.paused)
        await producer.pause()

      if(this.constraints[producer.kind] === true && producer.paused)
        await producer.resume()
    }
  }

  //Получение всех продьюсеров у одного пользователя-вещателя
  getProducers(){
    return Array.from(this.producers.values())
  }

  //Получение всех консьюмеров у одного пользователя-приемника
  getConsumers(user_id: string){
    const arr = []
    for(let consumers of this.consumers.values())
      arr.push(consumers.get(user_id))
    return arr
  }

  close(){
    this.produceTransport.close()
    for(let consumerTransport of this.consumeTransports.values())
      consumerTransport.close()
  }

}

export default Connector