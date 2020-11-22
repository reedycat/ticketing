import axios from 'axios'

const buildClient = ({ req }) => {
	if (typeof window === 'undefined') {
		// we are on the server!
		// request shoul be made to http://SERVICENAME.NAMESPACE.SVC.CLUSTER.LOCAL
		return axios.create({
			baseURL:
				'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
			headers: req.headers
		})
	} else {
		// we are on the client (i.e. browser)!
		// requests can be made with a base url of '' (empty string)
		return axios.create({
			baseURL: '/'
		})
	}
}

export default buildClient
