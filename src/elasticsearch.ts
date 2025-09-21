import { winstonLogger } from '@binh040105/jobber-shared'
import {Client} from '@elastic/elasticsearch'
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types'
import { config } from './config'
import { Logger } from 'winston'

const log : Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationElasticSearch', 'debug')

const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
})

export const checkConnection = async () : Promise<void> => {
  let isConnected = false

  while(!isConnected){
    try {
      const health : ClusterHealthResponse = await elasticSearchClient.cluster.health({})
      log.info(`NotificationService Elasticsearch health status - ${health.status}`)
      isConnected = true
    } catch (error) {
      log.error('Connection to ElasticSearch failed. Retrying...')
      log.log('error', 'NotificationService checkConnection() method:', error)
    }
  }
}