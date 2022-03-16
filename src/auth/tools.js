import jwt from 'jsonwebtoken'

export const authenticateAuthor = async author => {

    const accessToken = await generateJWTToken({_id:author._id, role: author.role})
    return accessToken
}

const generateJWTToken = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  )

export const verifyJWTToken = token => 
    new Promise((resolve, reject) => 
        jwt.verify(
            token, 
            process.env.JWT_SECRET, 
            (err, payload) => {
                if(err) reject(err)
                else resolve(payload)
            })
        )